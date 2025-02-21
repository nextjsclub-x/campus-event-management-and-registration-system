import { get, post } from '@/utils/request';
import type { UserInfo, UserListResponse } from '@/types/user.type';
import type { APIResponse } from '@/types/api-response.types';

/**
 * 获取用户列表
 */
export function getUserList(params?: {
  page?: number;
  pageSize?: number;
}): Promise<APIResponse<UserListResponse>> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get(`/api/user?${searchParams.toString()}`);
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser(): Promise<APIResponse<UserInfo>> {
  return get('/api/user/info');
}

/**
 * 获取指定用户信息
 */
export function getUserInfo(userId: number): Promise<APIResponse<UserInfo>> {
  return get(`/api/users/${userId}`);
}

/**
 * 更新用户密码
 */
export function updatePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<APIResponse<null>> {
  return post('/api/user/password', data);
}
