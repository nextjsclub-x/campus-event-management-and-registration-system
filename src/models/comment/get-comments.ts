import { and, eq, desc, asc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { PaginationOptions } from '@/types/pagination.types';
import type { ListCommentsFilter, CommentListResponse } from '@/types/comment.types';

/**
 * 获取评论列表
 * @param filters - 过滤条件，可按状态和用户ID筛选
 * @param pagination - 分页参数
 * @returns 返回评论列表和总数
 */
export async function getComments(filters: ListCommentsFilter, pagination: PaginationOptions): Promise<CommentListResponse> {
  const { status, userId } = filters;
  const { page = 1, limit = 10, order = 'desc' } = pagination;
  const offset = (page - 1) * limit;

  // 1. 构建查询条件
  const conditions = [sql`${comments.deletedAt} IS NULL`];

  // 添加状态过滤条件
  if (typeof status !== 'undefined') {
    conditions.push(eq(comments.status, status));
  }
  // 添加用户ID过滤条件
  if (userId) {
    conditions.push(eq(comments.userId, userId));
  }

  // 2. 查询总记录数
  const [{ count }] = await db
    .select({
      count: sql`count(*)`.mapWith(Number),
    })
    .from(comments)
    .where(and(...conditions));

  // 3. 查询分页数据
  const results = await db
    .select()
    .from(comments)
    .where(and(...conditions))
    .orderBy(order === 'desc' ? desc(comments.createdAt) : asc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(count / limit);

  return {
    items: results,
    total: count,
    totalPages,
    currentPage: page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
} 
