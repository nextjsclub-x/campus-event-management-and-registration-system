'use client';

import { APIJsonResponse } from '@/schema/api-response.schema';
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

const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<APIJsonResponse<T>> => {
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

    const result = await response.json() as APIJsonResponse<T>;

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

export default request;
