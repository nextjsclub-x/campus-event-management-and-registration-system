import { and, eq, sql, desc, asc } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { users } from '@/schema/user.schema';
import type { RegistrationStatusType } from './utils';

export async function getActivityRegistrations(
	activityId: number,
	options: {
		status?: RegistrationStatusType;
		page?: number;
		pageSize?: number;
		orderBy?: 'registeredAt' | 'status';
		order?: 'asc' | 'desc';
	} = {},
) {
	const {
		status,
		page = 1,
		pageSize = 20,
		orderBy = 'registeredAt',
		order = 'desc',
	} = options;

	// 1. 构建基础条件
	const conditions = [eq(registrations.activityId, activityId)];
	if (status !== undefined) {
		conditions.push(eq(registrations.status, status));
	}

	// 2. 构建基础查询
	const orderByColumn =
		orderBy === 'registeredAt'
			? registrations.registeredAt
			: registrations.status;
	const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
	const offset = (page - 1) * pageSize;

	const query = db
		.select({
			id: registrations.id,
			userId: registrations.userId,
			activityId: registrations.activityId,
			status: registrations.status,
			registeredAt: registrations.registeredAt,
			userName: users.name,
		})
		.from(registrations)
		.leftJoin(users, eq(registrations.userId, users.id))
		.where(and(...conditions));

	const registrationList = await query
		.orderBy(orderExpr)
		.limit(pageSize)
		.offset(offset);

	// 6. 获取总数（使用同样的条件）
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(registrations)
		.where(and(...conditions));

	return {
		registrations: registrationList,
		pagination: {
			current: page,
			pageSize,
			total: count,
			totalPages: Math.ceil(count / pageSize),
		},
	};
}

