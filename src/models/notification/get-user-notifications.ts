'use server';

import { and, eq, desc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { notifications } from '@/schema/notification.schema';
import type {
	ListNotificationsFilter,
	Pagination,
	PaginatedNotifications,
} from './utils';

export async function getUserNotifications(
	userId: number,
	filters: ListNotificationsFilter = {},
	pagination: Pagination = {},
): Promise<PaginatedNotifications> {
	const { isRead } = filters;
	const { page = 1, pageSize = 10 } = pagination;
	const offset = (page - 1) * pageSize;

	// 1. 收集查询条件
	const conditions = [eq(notifications.userId, userId)];
	if (typeof isRead !== 'undefined') {
		conditions.push(eq(notifications.isRead, isRead ? 1 : 0));
	}

	// 2. 查询总数
	const [{ count }] = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(notifications)
		.where(and(...conditions));

	// 3. 查询分页数据
	const results = await db
		.select()
		.from(notifications)
		.where(and(...conditions))
		.orderBy(desc(notifications.createdAt))
		.limit(pageSize)
		.offset(offset);

	return {
		notifications: results,
		total: count,
	};
}

