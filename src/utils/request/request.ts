'use client';

import { APIResponse } from '@/schema/api-response.schema';
import { useUserStore } from '@/store/user';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  data?: any;
}

class RequestError extends Error {
  public code: number;

  public data: any;

  constructor(message: string, code: number, data: any = null) {
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

// 添加这个函数用于页面跳转
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<APIResponse<T>> => {
  const {
    params,
    data,
    headers = {},
    method = 'GET',
    ...restOptions
  } = options;

  // 处理URL参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url = `${url}?${searchParams.toString()}`;
  }

  // 处理请求头
  const token = getToken();
  if (token) {
    Object.assign(headers, {
      Authorization: `Bearer ${token}`
    });
  }

  // 处理请求体
  if (data) {
    Object.assign(headers, {
      'Content-Type': 'application/json'
    });
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json() as APIResponse<T>;

    // 处理 401 状态码
    if (response.status === 401) {
      // 清空本地存储
      useUserStore.getState().clearUserInfo();
      
      // 调用登出接口
      await fetch('/api/sign-out', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 如果不是登出接口本身的请求，则跳转到登录页面并抛出错误
      if (url !== '/api/sign-out') {
        redirectToLogin();
        throw new RequestError(result.message, result.code, result.data);
      }
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
      500
    );
  }
};

// 导出便捷方法
export const get = <T = any>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' });

export const post = <T = any>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', data });

export const put = <T = any>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PUT', data });

export const del = <T = any>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' });

export const patch = <T = any>(url: string, data?: any, options?: RequestOptions) =>
  request<T>(url, { ...options, method: 'PATCH', data });

export const head = <T = any>(url: string, options?: RequestOptions) => 
  request<T>(url, { ...options, method: 'HEAD' });

export default request;
