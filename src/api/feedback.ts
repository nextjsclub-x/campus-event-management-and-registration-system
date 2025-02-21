import { get, post, put, del } from '@/utils/request';
import type { Feedback, FeedbackStats } from '@/types/feedback.types';
import type { PaginatedResponse } from '@/types/pagination.types';

/**
 * 获取反馈列表
 * @param params 查询参数
 */
export const getFeedbackList = (params?: {
  activityId?: number;
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();

  if (params?.activityId !== undefined) {
    searchParams.append('activityId', params.activityId.toString());
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get<PaginatedResponse<Feedback>>(`/api/feedbacks?${searchParams.toString()}`);
};

/**
 * 创建新反馈
 * @param data 反馈数据
 */
export const createFeedback = (data: {
  activityId: number;
  comment: string;
  rating: number;
}) => post<Feedback>('/api/feedbacks', data);

/**
 * 获取反馈详情
 * @param id 反馈ID
 */
export const getFeedback = (id: number) => 
  get<Feedback>(`/api/feedbacks/${id}`);

/**
 * 更新反馈
 * @param id 反馈ID
 * @param data 更新数据
 */
export const updateFeedback = (id: number, data: {
  comment: string;
  rating: number;
}) => put<Feedback>(`/api/feedbacks/${id}`, data);

/**
 * 删除反馈
 * @param id 反馈ID
 */
export const deleteFeedback = (id: number) => 
  del(`/api/feedbacks/${id}`);

/**
 * 使用示例：
 * ```typescript
 * // 获取反馈列表
 * const response = await getFeedbackList({
 *   activityId: 1,
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // 创建新反馈
 * const createResponse = await createFeedback({
 *   activityId: 1,
 *   comment: '这是一条反馈',
 *   rating: 5
 * });
 * 
 * // 更新反馈
 * const updateResponse = await updateFeedback(1, {
 *   comment: '更新后的反馈内容',
 *   rating: 4
 * });
 * 
 * // 删除反馈
 * await deleteFeedback(1);
 * ```
 */ 
