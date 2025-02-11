// 'use server'

import { and, eq, desc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { Comment, NewComment } from '@/schema/comment.schema';

/**
 * 评论状态枚举
 * PENDING: 待审核 - 新创建的评论默认状态
 * APPROVED: 已通过 - 管理员审核通过
 * REJECTED: 已拒绝 - 管理员审核拒绝
 * WITHDRAWN: 已撤回 - 用户自行撤回
 */
export const CommentStatus = {
  PENDING: 0,    // 待审核
  APPROVED: 1,   // 已通过
  REJECTED: 2,   // 已拒绝
  WITHDRAWN: 3,  // 已撤回
} as const;

// 评论状态类型，用于类型检查
export type CommentStatusType = typeof CommentStatus[keyof typeof CommentStatus];

// ====================
//  评论管理模块
// ====================

/**
 * 创建新评论
 * @param data - 评论数据，包含用户ID、标题、内容等
 * @returns 返回创建成功的评论对象
 */
export async function createComment(data: NewComment) {
  const [comment] = await db.insert(comments)
    .values({
      ...data,
      createdAt: new Date()
    })
    .returning();
  
  return comment;
}

/**
 * 评论列表查询过滤条件接口
 */
interface ListCommentsFilter {
  status?: CommentStatusType;  // 评论状态过滤
  userId?: number;             // 用户ID过滤
}

/**
 * 分页参数接口
 */
interface Pagination {
  page?: number;      // 当前页码
  pageSize?: number;  // 每页条数
}

/**
 * 获取评论列表
 * @param filters - 过滤条件，可按状态和用户ID筛选
 * @param pagination - 分页参数
 * @returns 返回评论列表和总数
 */
export async function getComments(filters: ListCommentsFilter = {}, pagination: Pagination = {}) {
  const { status, userId } = filters;
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (page - 1) * pageSize;

  // 1. 构建查询条件
  // 使用原生SQL检查软删除字段
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
    .orderBy(desc(comments.createdAt))  // 按创建时间降序排序
    .limit(pageSize)
    .offset(offset);

  return {
    comments: results,
    total: count,
  };
}

/**
 * 获取评论详情
 * @param id - 评论ID
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回评论详情
 */
export async function getCommentById(id: number) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id));

  if (!comment) {
    throw new Error('评论不存在');
  }

  return comment;
}

/**
 * 更新评论状态
 * @param id - 评论ID
 * @param status - 新的评论状态
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回更新后的评论对象
 */
export async function updateCommentStatus(id: number, status: CommentStatusType) {
  const [comment] = await db
    .update(comments)
    .set({ 
      status,
      updatedAt: new Date()
    })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) {
    throw new Error('评论不存在');
  }

  return comment;
}

/**
 * 软删除评论
 * @param id - 评论ID
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回成功消息
 */
export async function deleteComment(id: number) {
  const [comment] = await db
    .update(comments)
    .set({ 
      deletedAt: new Date(),  // 设置删除时间，实现软删除
      updatedAt: new Date()
    })
    .where(eq(comments.id, id))
    .returning();

  if (!comment) {
    throw new Error('评论不存在');
  }

  return { message: '评论删除成功' };
}
