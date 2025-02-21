import { get, post, put } from '@/utils/request';
import type {
  AdminRegistrationsResponse,
  ActivityRegistrationsResponse,
  UserRegistrationsResponse,
  RegistrationStatusUpdateResponse,
  RegistrationAnalytics,
  ParticipationAnalytics,
} from '@/types/registration.types';
import type { APIResponse } from '@/types/api-response.types';

/**
 * 获取报名列表
 */
export function getRegistrationList(params?: {
  page?: number;
  pageSize?: number;
}): Promise<APIResponse<AdminRegistrationsResponse>> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get(`/api/admin/registrations?${searchParams.toString()}`);
}

/**
 * 获取活动的报名列表
 */
export function getActivityRegistrations(activityId: number, params?: {
  page?: number;
  pageSize?: number;
}): Promise<APIResponse<ActivityRegistrationsResponse>> {
  const searchParams = new URLSearchParams();

  searchParams.append('activityId', activityId.toString());
  
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get(`/api/registrations?${searchParams.toString()}`);
}

/**
 * 获取用户的报名列表
 */
export function getUserRegistrations(userId: number, params?: {
  page?: number;
  pageSize?: number;
}): Promise<APIResponse<UserRegistrationsResponse>> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get(`/api/users/${userId}/registrations?${searchParams.toString()}`);
}

/**
 * 创建报名
 */
export function createRegistration(data: {
  activityId: number;
}): Promise<APIResponse<RegistrationStatusUpdateResponse>> {
  return post('/api/registrations', data);
}

/**
 * 取消报名
 */
export function cancelRegistration(id: number): Promise<APIResponse<RegistrationStatusUpdateResponse>> {
  return put(`/api/registrations/${id}/cancel`);
}

/**
 * 获取报名统计信息
 */
export function getRegistrationStats(): Promise<APIResponse<RegistrationAnalytics>> {
  return get('/api/registrations/stats');
}

/**
 * 获取报名分析数据
 */
export function getRegistrationAnalytics(params?: {
  activityId?: number;
  days?: number;
}): Promise<APIResponse<ParticipationAnalytics>> {
  const searchParams = new URLSearchParams();

  if (params?.activityId) {
    searchParams.append('activityId', params.activityId.toString());
  }
  if (params?.days) {
    searchParams.append('days', params.days.toString());
  }

  return get(`/api/registrations/analytics?${searchParams.toString()}`);
}

/**
 * 使用示例：
 * ```typescript
 * // 获取活动的报名列表
 * const activityRegistrations = await getRegistrationList({
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // 获取用户的报名列表
 * const userRegistrations = await getUserRegistrations(1, {
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // 创建报名
 * const registration = await createRegistration({
 *   activityId: 1,
 * });
 * 
 * // 取消报名
 * await cancelRegistration(1);
 * 
 * // 获取报名统计
 * const stats = await getRegistrationStats();
 * 
 * // 获取报名分析数据
 * const analytics = await getRegistrationAnalytics({
 *   activityId: 1,
 *   days: 30
 * });
 * ```
 */ 
