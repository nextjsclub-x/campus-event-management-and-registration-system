import { bigserial, timestamp, text, smallint, bigint, pgTable, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

// 反馈表：用于存储用户对活动的评价和反馈
export const feedback = pgTable('feedback', {
  // 反馈ID：自增主键
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 用户ID：关联到用户表的外键
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  // 活动ID：关联到活动表的外键
  activityId: bigint('activity_id', { mode: 'number' }).notNull().references(() => activities.id),
  // 评分：用户对活动的评分
  rating: smallint('rating').notNull(),
  // 评价内容
  comment: text('comment').notNull(),
  // 创建时间
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // 用户ID索引：用于加速按用户查询反馈的性能
  userIdIdx: index('idx_feedback_user_id').on(table.userId),
  // 活动ID索引：用于加速按活动查询反馈的性能
  activityIdIdx: index('idx_feedback_activity_id').on(table.activityId),
}));

// 类型推导
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
