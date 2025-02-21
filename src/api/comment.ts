import { get, post, patch, del } from '@/utils/request';
import type { Comment } from '@/schema/comment.schema';
import type { ListCommentsFilter } from '@/types/comment.types';
import type { PaginationOptions } from '@/types/pagination.types';
import type { APIResponse } from '@/types/api-response.types';

/**
 * 获取评论列表
 */
export async function getCommentList(params: {
  filters?: ListCommentsFilter;
  pagination?: Partial<PaginationOptions>;
}): Promise<APIResponse<Comment[]>> {
  const { filters = {}, pagination = {} } = params;
  const searchParams = new URLSearchParams();

  // 添加过滤条件
  if (filters.status !== undefined) {
    searchParams.append('status', filters.status.toString());
  }
  if (filters.userId) {
    searchParams.append('userId', filters.userId.toString());
  }

  // 添加分页参数
  if (pagination.page) {
    searchParams.append('page', pagination.page.toString());
  }
  if (pagination.limit) {
    searchParams.append('limit', pagination.limit.toString());
  }
  if (pagination.sortBy) {
    searchParams.append('sortBy', pagination.sortBy);
  }
  if (pagination.order) {
    searchParams.append('order', pagination.order);
  }

  return get(`/api/comments?${searchParams.toString()}`);
}

/**
 * 获取评论详情
 */
export async function getComment(id: number): Promise<APIResponse<Comment>> {
  return get(`/api/comments/${id}`);
}

/**
 * 创建评论
 */
export async function createComment(data: {
  userId: number;
  title: string;
  content: string;
}): Promise<APIResponse<Comment>> {
  return post('/api/comments', data);
}

/**
 * 更新评论状态
 */
export async function updateCommentStatus(
  id: number,
  status: number
): Promise<APIResponse<Comment>> {
  return patch(`/api/comments/${id}/status`, { status });
}

/**
 * 删除评论
 */
export async function deleteComment(id: number): Promise<APIResponse<{ message: string }>> {
  return del(`/api/comments/${id}`);
}

/**
 * 使用示例：
 * ```typescript
 * // 获取评论列表
 * const response = await getCommentList({
 *   filters: {
 *     status: CommentStatusType.APPROVED,
 *     userId: 123
 *   },
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     sortBy: 'createdAt',
 *     order: 'desc'
 *   }
 * });
 * 
 * if (response.code === 200) {
 *   const { items, total, totalPages } = response.data;
 *   console.log('评论列表:', items);
 *   console.log('总数:', total);
 *   console.log('总页数:', totalPages);
 * }
 * 
 * // 创建新评论
 * const createResponse = await createComment({
 *   userId: 123,
 *   title: '这是一个新评论',
 *   content: '评论内容...'
 * });
 * 
 * if (createResponse.code === 201) {
 *   console.log('评论创建成功:', createResponse.data);
 * }
 * ```
 */ 
