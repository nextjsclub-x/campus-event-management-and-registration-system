import type { Comment } from '@/schema/comment.schema';
import type { PaginatedResponse } from './pagination.types';

/**
 * 评论状态枚举
 * PENDING: 待审核 - 新创建的评论默认状态
 * APPROVED: 已通过 - 管理员审核通过
 * REJECTED: 已拒绝 - 管理员审核拒绝
 * WITHDRAWN: 已撤回 - 用户自行撤回
 */
export enum CommentStatusType {
  PENDING = 0,  // 待审核
  APPROVED = 1, // 已通过
  REJECTED = 2, // 已拒绝
  WITHDRAWN = 3 // 已撤回
}

/**
 * 评论列表查询过滤条件接口
 */
export interface ListCommentsFilter {
  /** 评论状态过滤 */
  status?: CommentStatusType;
  /** 用户ID过滤 */
  userId?: number;
}

/**
 * 创建评论请求数据
 */
export interface CreateCommentData {
  /** 用户ID */
  userId: number;
  /** 评论标题 */
  title: string;
  /** 评论内容 */
  content: string;
}

/**
 * 评论列表响应类型
 */
export type CommentListResponse = PaginatedResponse<Comment>;
