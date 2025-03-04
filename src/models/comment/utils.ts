import type { comments } from '@/schema/comment.schema';

/**
 * 评论类型
 */
export type Comment = typeof comments.$inferSelect;

/**
 * 新建评论类型
 */
export type NewComment = typeof comments.$inferInsert;
