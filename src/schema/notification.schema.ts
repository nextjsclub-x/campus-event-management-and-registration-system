import {
	bigserial,
	timestamp,
	text,
	smallint,
	index,
	bigint,
	pgTable,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

// 通知表：用于存储系统发送给用户的各类通知信息
export const notifications = pgTable(
	'notifications',
	{
		// 通知ID：自增主键
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		// 用户ID：关联到用户表的外键，表示通知的接收者
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		// 活动ID：关联到活动表的外键，表示通知相关的活动（可为空）
		activityId: bigint('activity_id', { mode: 'number' }).references(
			() => activities.id,
		),
		// 通知内容：存储通知的具体文本信息
		message: text('message').notNull(),
		// 创建时间：通知创建的时间戳
		createdAt: timestamp('created_at').defaultNow().notNull(),
		// 阅读状态：0表示未读，1表示已读
		isRead: smallint('is_read').default(0).notNull(),
	},
	(table) => ({
		// 用户ID索引：用于加速按用户查询通知的性能
		userIdIdx: index('idx_notifications_user_id').on(table.userId),
		// 活动ID索引：用于加速按活动查询通知的性能
		activityIdIdx: index('idx_notifications_activity_id').on(table.activityId),
	}),
);

// 类型推导
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

