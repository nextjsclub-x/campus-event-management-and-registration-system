import { get, post, put } from '@/utils/request';
import type { Notification } from '@/schema/notification.schema';
import type { PaginatedResponse } from '@/types/pagination.types';

/**
 * 获取用户通知列表
 * @param params 查询参数
 */
export const getUserNotifications = (params?: {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.isRead !== undefined) {
    searchParams.append('isRead', params.isRead.toString());
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get<PaginatedResponse<Notification>>(`/api/notifications?${searchParams.toString()}`);
};

/**
 * 获取通知详情
 * @param id 通知ID
 */
export const getNotification = (id: number) => 
  get<Notification>(`/api/notifications/${id}`);

/**
 * 标记通知为已读
 * @param id 通知ID
 */
export const markNotificationAsRead = (id: number) => 
  put<{ message: string }>(`/api/notifications/${id}`, {});

/**
 * 创建新通知
 * @param data 通知数据
 */
export const createNotification = (data: {
  userId: number;
  activityId: number;
  message: string;
}) => post<Notification>('/api/notifications/create', data);

/**
 * 使用示例：
 * ```typescript
 * // 获取通知列表
 * const response = await getUserNotifications({
 *   isRead: false,
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * if (response.code === 200) {
 *   const { notifications, total } = response.data;
 *   console.log('通知列表:', notifications);
 *   console.log('总数:', total);
 * }
 * 
 * // 获取单个通知
 * const notification = await getNotification(1);
 * if (notification.code === 200) {
 *   console.log('通知详情:', notification.data);
 * }
 * 
 * // 标记通知已读
 * const markResponse = await markNotificationAsRead(1);
 * if (markResponse.code === 200) {
 *   console.log('标记成功:', markResponse.data.message);
 * }
 * 
 * // 创建新通知
 * const createResponse = await createNotification({
 *   userId: 1,
 *   activityId: 1,
 *   message: '您的活动申请已通过审核'
 * });
 * if (createResponse.code === 201) {
 *   console.log('通知创建成功:', createResponse.data);
 * }
 * ```
 */ 
