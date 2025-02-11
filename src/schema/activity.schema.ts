import { bigserial, timestamp, varchar, text, integer, smallint, index, bigint, pgTable } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// Activities table
export const activities = pgTable('activities', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 活动ID
  organizerId: bigint('organizer_id', { mode: 'number' }).notNull().references(() => users.id),
  // 组织者ID
  title: varchar('title', { length: 255 }).notNull(),
  // 活动标题
  description: text('description').notNull(),
  // 活动描述
  categoryId: bigint('category_id', { mode: 'number' }).notNull(),
  // 活动类别ID
  location: varchar('location', { length: 255 }).notNull(),
  // 活动地点
  startTime: timestamp('start_time').notNull(),
  // 活动开始时间
  endTime: timestamp('end_time').notNull(),
  // 活动结束时间
  capacity: integer('capacity').default(0).notNull(),
  // 活动容量
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 创建时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // 更新时间
  status: smallint('status').default(1).notNull(),
  // 活动状态
}, (table) => ({
    organizerIdIdx: index('idx_activities_organizer_id').on(table.organizerId),
    // 组织者ID索引
  }));

// 类型推导
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
