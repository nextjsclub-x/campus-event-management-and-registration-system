'lock';

/* eslint-disable no-shadow */
export enum APIStatusCode {
	SUCCESS = 200, // 成功
	CREATED = 201, // 创建成功
	BAD_REQUEST = 400, // 错误请求
	UNAUTHORIZED = 401, // 未授权
	FORBIDDEN = 403, // 禁止访问
	NOT_FOUND = 404, // 未找到
	INTERNAL_ERROR = 500, // 服务器内部错误
	SERVICE_UNAVAILABLE = 503, // 服务不可用
}

export interface APIResponse<T = unknown> {
	code: number;
	message: string;
	data: T | null;
}

