import { bigserial, timestamp, smallint, index, bigint, pgTable } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

// 报名状态枚举
export enum RegistrationStatus {
  PENDING = 0,    // 待审核
  CONFIRMED = 1,  // 已确认
  CANCELLED = 2,  // 已取消
  REJECTED = 3,   // 已拒绝
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
