import {
	bigserial,
	timestamp,
	smallint,
	index,
	bigint,
	pgTable,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

// 报名状态枚举
export enum RegistrationStatus {
	CANCELLED = 0, // 已取消
	PENDING = 1, // 待审核（默认状态）
	APPROVED = 2, // 已批准
	REJECTED = 3, // 已拒绝
	WAITLIST = 4, // 候补名单
	ATTENDED = 5, // 已参加
	ABSENT = 6, // 未出席
}

// Registrations table
export const registrations = pgTable(
	'registrations',
	{
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		// 注册ID
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		// 用户ID，不能为空，关联到用户表的ID
		activityId: bigint('activity_id', { mode: 'number' })
			.notNull()
			.references(() => activities.id),
		// 活动ID，不能为空，关联到活动表的ID
		registeredAt: timestamp('registered_at').defaultNow().notNull(),
		// 注册时间，默认为当前时间，不能为空
		status: smallint('status').default(RegistrationStatus.PENDING).notNull(),
		// 注册状态，默认为待处理（PENDING），不能为空
	},
	(table) => ({
		userIdIdx: index('idx_registrations_user_id').on(table.userId),
		// 为用户ID创建索引
		activityIdIdx: index('idx_registrations_activity_id').on(table.activityId),
		// 为活动ID创建索引
	}),
);

// 类型推导
export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

