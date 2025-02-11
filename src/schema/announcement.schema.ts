import { bigserial, timestamp, text, varchar, smallint, pgTable } from 'drizzle-orm/pg-core';

// 公告表：用于存储系统公告信息
export const announcements = pgTable('announcements', {
  // 公告ID：自增主键
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 公告标题
  title: varchar('title', { length: 255 }).notNull(),
  // 公告内容
  content: text('content').notNull(),
  // 发布状态：0表示未发布，1表示已发布
  isPublished: smallint('is_published').default(0).notNull(),
  // 创建时间
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 更新时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // 软删除时间
  deletedAt: timestamp('deleted_at'),
}); 

// 类型推导
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert; 
