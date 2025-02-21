import { get, post, put, del } from '@/utils/request';
import type { Activity, ActivityStatus, ActivityStatusType } from '@/types/activity.types';
import type { PaginatedResponse } from '@/types/pagination.types';

/**
 * 获取活动列表
 * @param params 查询参数
 */
export const getActivityList = (params: {
  status?: number;
  categoryId?: number;
  startTime?: Date;
  endTime?: Date;
  page?: number;
  pageSize?: number;
  orderBy?: 'startTime' | 'createdAt';
  order?: 'asc' | 'desc';
}) => {
  const searchParams = new URLSearchParams();

  if (params.status !== undefined) {
    searchParams.append('status', params.status.toString());
  }
  if (params.categoryId !== undefined) {
    searchParams.append('categoryId', params.categoryId.toString());
  }
  if (params.startTime) {
    searchParams.append('startTime', params.startTime.toISOString());
  }
  if (params.endTime) {
    searchParams.append('endTime', params.endTime.toISOString());
  }
  if (params.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }
  if (params.orderBy) {
    searchParams.append('orderBy', params.orderBy);
  }
  if (params.order) {
    searchParams.append('order', params.order);
  }

  return get<PaginatedResponse<Activity>>(`/api/activities?${searchParams.toString()}`);
};

/**
 * 创建新活动
 * @param data 活动数据
 */
export const createActivity = (data: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  categoryId: number;
}) => post<Activity>('/api/activities/create', {
    ...data,
    startTime: data.startTime.toISOString(),
    endTime: data.endTime.toISOString(),
  });

/**
 * 获取活动详情
 * @param id 活动ID
 */
export const getActivity = (id: number) => 
  get<Activity>(`/api/activities/${id}`);

/**
 * 更新活动
 * @param id 活动ID
 * @param data 更新数据
 */
export const updateActivity = (id: number, data: {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  capacity?: number;
  categoryId?: number;
}) => {
  const payload = {
    ...data,
    startTime: data.startTime?.toISOString(),
    endTime: data.endTime?.toISOString(),
  };
  return put<Activity>(`/api/activities/${id}`, payload);
};

/**
 * 删除活动
 * @param id 活动ID
 */
export const deleteActivity = (id: number) => 
  del(`/api/activities/${id}`);

/**
 * 更新活动状态
 * @param id 活动ID
 * @param status 新状态
 * @param reason 原因（可选）
 */
export const updateActivityStatus = (id: number, status: ActivityStatusType, reason?: string) => 
  put<Activity>(`/api/activities/${id}/status`, { status, reason });

/**
 * 获取组织者的活动列表
 * @param organizerId 组织者ID
 * @param params 分页参数
 */
export const getOrganizerActivities = (organizerId: number, params?: {
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }
  return get<PaginatedResponse<Activity>>(`/api/activities/organizer/${organizerId}?${searchParams.toString()}`);
};

/**
 * 获取热门活动列表
 * @param limit 限制数量
 */
export const getPopularActivities = (limit?: number) => {
  const searchParams = new URLSearchParams();
  if (limit) {
    searchParams.append('limit', limit.toString());
  }
  return get<Activity[]>(`/api/activities/popular?${searchParams.toString()}`);
};

/**
 * 获取活动统计数据
 */
export const getActivityStats = () => 
  get<{
    statusCount: { [key: number]: number };
    recentCount: number;
  }>('/api/activities/stats');

/**
 * 使用示例：
 * ```typescript
 * // 获取活动列表
 * const response = await getActivityList({
 *   status: ActivityStatus.PUBLISHED,
 *   categoryId: 1,
 *   page: 1,
 *   pageSize: 20,
 *   orderBy: 'startTime',
 *   order: 'desc'
 * });
 * 
 * if (response.code === 200) {
 *   const { items, total, totalPages } = response.data;
 *   console.log('活动列表:', items);
 *   console.log('总数:', total);
 *   console.log('总页数:', totalPages);
 * }
 * 
 * // 创建新活动
 * const createResponse = await createActivity({
 *   title: '活动标题',
 *   description: '活动描述',
 *   startTime: new Date('2024-03-01T10:00:00Z'),
 *   endTime: new Date('2024-03-01T12:00:00Z'),
 *   location: '活动地点',
 *   capacity: 100,
 *   categoryId: 1
 * });
 * 
 * if (createResponse.code === 201) {
 *   console.log('活动创建成功，等待审核:', createResponse.data);
 * }
 * 
 * // 更新活动状态
 * const statusResponse = await updateActivityStatus(1, ActivityStatus.PUBLISHED);
 * if (statusResponse.code === 200) {
 *   console.log('活动状态更新成功:', statusResponse.data);
 * }
 * 
 * // 获取热门活动
 * const popularResponse = await getPopularActivities(10);
 * if (popularResponse.code === 200) {
 *   console.log('热门活动:', popularResponse.data);
 * }
 * ```
 */ 
