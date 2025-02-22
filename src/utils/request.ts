'use client';

import type { APIResponse } from '@/types/api-response.types';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
	data?: unknown;
}

class RequestError extends Error {
	public code: number;

	public data: unknown;

	constructor(message: string, code: number, data: unknown = null) {
		super(message);
		this.code = code;
		this.data = data;
	}
}

const getToken = () => {
	if (typeof window !== 'undefined') {
		return useUserStore.getState().token;
	}
	return null;
};

// 修改跳转函数
const redirectToLogin = () => {
	if (typeof window !== 'undefined') {
		window.location.replace('/login');
	}
};

const request = async <T = unknown>(
	url: string,
	options: RequestOptions = {},
): Promise<APIResponse<T>> => {
	const {
		params,
		data,
		headers = {},
		method = 'GET',
		...restOptions
	} = options;

	// 处理URL参数
	let finalUrl = url;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			searchParams.append(key, value);
		}
		finalUrl = `${url}?${searchParams.toString()}`;
	}

	// 处理请求头
	const token = getToken();
	const userId = useUserStore.getState().id;
	if (token) {
		Object.assign(headers, {
			Authorization: `Bearer ${token}`,
			'x-user-id': userId || '',
		});
	}

	// 处理请求体
	if (data) {
		Object.assign(headers, {
			'Content-Type': 'application/json',
		});
	}

	try {
		const response = await fetch(finalUrl, {
			...restOptions,
			method,
			headers,
			body: data ? JSON.stringify(data) : undefined,
			cache: 'no-store',
		});

		const result = (await response.json()) as APIResponse<T>;

		// 处理 401 状态码
		if (response.status === 401) {
			// 清空本地存储
			useUserStore.getState().clearUserInfo();

			// 调用登出接口
			await fetch('/api/sign-out', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// 如果不是登出接口本身的请求，则跳转到登录页面
			if (!finalUrl.includes('/api/sign-out')) {
				redirectToLogin();
			}
			throw new RequestError(result.message || '未授权访问', response.status, result.data);
		}

		if (!response.ok) {
			throw new RequestError(result.message, result.code, result.data);
		}

		return result;
	} catch (error) {
		if (error instanceof RequestError) {
			throw error;
		}

		throw new RequestError(
			error instanceof Error ? error.message : '请求失败',
			500,
		);
	}
};

// 导出便捷方法
export const get = <T = unknown>(url: string, options?: RequestOptions) =>
	request<T>(url, { ...options, method: 'GET' });

export const post = <T = unknown>(
	url: string,
	data?: unknown,
	options?: RequestOptions,
) => request<T>(url, { ...options, method: 'POST', data });

export const put = <T = unknown>(
	url: string,
	data?: unknown,
	options?: RequestOptions,
) => request<T>(url, { ...options, method: 'PUT', data });

export const del = <T = unknown>(url: string, options?: RequestOptions) =>
	request<T>(url, { ...options, method: 'DELETE' });

export const patch = <T = unknown>(
	url: string,
	data?: unknown,
	options?: RequestOptions,
) => request<T>(url, { ...options, method: 'PATCH', data });

export const head = <T = unknown>(url: string, options?: RequestOptions) =>
	request<T>(url, { ...options, method: 'HEAD' });

export default request;

// 使用示例：

// GET 请求示例
/*
interface UserResponse {
    id: number;
    name: string;
    age: number;
}

// 带参数的GET请求
const getUser = await get<UserResponse>('/api/users', {
    params: {
        id: '123',
        role: 'admin'
    }
});
// 返回类型 APIResponse<UserResponse>
console.log(getUser.data.name);
*/

// POST 请求示例
/*
interface CreateUserRequest {
    name: string;
    email: string;
}

// 发送数据的POST请求
const createUser = await post<UserResponse>('/api/users', {
    name: '张三',
    email: 'zhangsan@example.com'
}, {
    headers: {
        'X-Custom-Header': 'value'
    }
});
// 返回类型 APIResponse<UserResponse>
console.log(createUser.data.id);
*/
