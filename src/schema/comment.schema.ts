import { bigserial, timestamp, text, smallint, bigint, pgTable, index, varchar } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// 评论表：用于存储用户的评论信息
export const comments = pgTable('comments', {
  // 评论ID：自增主键
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 用户ID：关联到用户表的外键
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  // 评论标题
  title: varchar('title', { length: 255 }).notNull(),
  // 评论内容
  content: text('content').notNull(),
  // 评论状态：0-待审核 1-已通过 2-已拒绝 3-已撤回
  status: smallint('status').notNull().default(0),
  // 创建时间
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 更新时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // 删除时间（软删除）
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // 用户ID索引：用于加速按用户查询评论的性能
  userIdIdx: index('idx_comments_user_id').on(table.userId),
}));

// 类型推导
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert; 
