'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import {
	ActivityStatus,
	type ActivityStatusType,
	type Activity,
} from '@/types/activity.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export async function listActivities(filters: {
	status?: ActivityStatusType;
	categoryId?: number;
	startTime?: Date;
	endTime?: Date;
	page?: number;
	pageSize?: number;
	orderBy?: 'startTime' | 'createdAt' | 'id';
	order?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Activity>> {
	const {
		status,
		categoryId,
		startTime,
		endTime,
		page = 1,
		pageSize = 20,
		orderBy = 'startTime',
		order = 'desc',
	} = filters;

	// 1. 构建查询条件
	const conditions = [];

	if (status !== undefined && status !== null) {
		conditions.push(eq(activities.status, status));
	}

	if (categoryId) {
		conditions.push(eq(activities.categoryId, categoryId));
	}

	if (startTime) {
		conditions.push(sql`${activities.startTime} >= ${startTime}`);
	}

	if (endTime) {
		conditions.push(sql`${activities.endTime} <= ${endTime}`);
	}

	// 2. 构建排序表达式
	let orderByColumn:
		| typeof activities.startTime
		| typeof activities.id
		| typeof activities.createdAt;
	switch (orderBy) {
		case 'startTime':
			orderByColumn = activities.startTime;
			break;
		case 'id':
			orderByColumn = activities.id;
			break;
		default:
			orderByColumn = activities.createdAt;
	}
	const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
	const offset = (page - 1) * pageSize;

	// 3. 执行查询
	const activityList = await db
		.select({
			id: activities.id,
			organizerId: activities.organizerId,
			title: activities.title,
			description: activities.description,
			categoryId: activities.categoryId,
			location: activities.location,
			startTime: activities.startTime,
			endTime: activities.endTime,
			capacity: activities.capacity,
			status: activities.status,
			createdAt: activities.createdAt,
			updatedAt: activities.updatedAt,
		})
		.from(activities)
		.where(and(...conditions))
		.orderBy(orderExpr)
		.limit(pageSize)
		.offset(offset);

	// 4. 获取总数
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(activities)
		.where(and(...conditions));

	const totalPages = Math.ceil(count / pageSize);

	return {
		items: activityList,
		total: count,
		totalPages,
		currentPage: page,
		limit: pageSize,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
}

