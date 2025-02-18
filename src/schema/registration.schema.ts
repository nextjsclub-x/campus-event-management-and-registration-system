import { bigserial, timestamp, smallint, index, bigint, pgTable } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

// 报名状态枚举
export enum RegistrationStatus {
  CANCELLED = 0,    // 已取消
  PENDING = 1,      // 待审核（默认状态）
  APPROVED = 2,     // 已批准
  REJECTED = 3,     // 已拒绝
  WAITLIST = 4,     // 候补名单
  ATTENDED = 5,     // 已参加
  ABSENT = 6        // 未出席
}

// Registrations table
export const registrations = pgTable('registrations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  activityId: bigint('activity_id', { mode: 'number' }).notNull().references(() => activities.id),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  status: smallint('status').default(RegistrationStatus.PENDING).notNull(),
}, (table) => ({
    userIdIdx: index('idx_registrations_user_id').on(table.userId),
    activityIdIdx: index('idx_registrations_activity_id').on(table.activityId),
  }));

// 类型推导
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
