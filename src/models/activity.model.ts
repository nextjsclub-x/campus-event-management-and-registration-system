'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import {
	registrations,
	RegistrationStatus,
} from '@/schema/registration.schema';
import { eq, and, desc, asc, sql, type SQL } from 'drizzle-orm';
import { ActivityStatus, type ActivityStatusType } from '@/types/activity.types';

// 使用drizzle的类型推导
type Activity = typeof activities.$inferSelect;
type NewActivity = typeof activities.$inferInsert;

// ====================
//  1. 获取单个活动
// ====================
export async function getActivity(activityId: number) {
	// 1. 获取活动基本信息
	const [activity] = await db
		.select()
		.from(activities)
		.where(eq(activities.id, activityId));

	if (!activity) {
		throw new Error('Activity not found');
	}

	// 2. 获取已批准的报名人数
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(registrations)
		.where(
			and(
				eq(registrations.activityId, activityId),
				eq(registrations.status, 2), // 只统计已批准的
			),
		);

	return {
		...activity,
		currentRegistrations: count,
	};
}

// ====================
//  2. 创建活动
// ====================
export async function createActivity(
	organizerId: number,
	activityData: {
		title: string;
		description: string;
		startTime: Date;
		endTime: Date;
		location: string;
		capacity: number;
		categoryId: number;
	},
) {
	// 1. 创建活动记录
	const [activity] = await db
		.insert(activities)
		.values({
			...activityData,
			organizerId,
			status: ActivityStatus.DRAFT, // 默认为草稿状态
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning({
			id: activities.id,
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
		});

	return activity;
}

// ====================
//  3. 更新活动
// ====================
export async function updateActivity(
	activityId: number,
	organizerId: number,
	activityData: {
		title?: string;
		description?: string;
		startTime?: Date;
		endTime?: Date;
		location?: string;
		capacity?: number;
		categoryId?: number;
	},
) {
	// 1. 检查活动是否存在且属于该组织者
	const [existingActivity] = await db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.id, activityId),
				eq(activities.organizerId, organizerId),
			),
		);

	if (!existingActivity) {
		throw new Error(
			'Activity not found or you do not have permission to update it',
		);
	}

	// 2. 更新活动信息
	const [updatedActivity] = await db
		.update(activities)
		.set({
			...activityData,
			updatedAt: new Date(),
		})
		.where(eq(activities.id, activityId))
		.returning({
			id: activities.id,
			title: activities.title,
			description: activities.description,
			categoryId: activities.categoryId,
			location: activities.location,
			startTime: activities.startTime,
			endTime: activities.endTime,
			capacity: activities.capacity,
			status: activities.status,
			updatedAt: activities.updatedAt,
		});

	return updatedActivity;
}

// ====================
//  4. 删除活动
// ====================
export async function deleteActivity(activityId: number, organizerId: number) {
	// 1. 检查活动是否存在且属于该组织者
	const [existingActivity] = await db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.id, activityId),
				eq(activities.organizerId, organizerId),
			),
		);

	if (!existingActivity) {
		throw new Error(
			'Activity not found or you do not have permission to delete it',
		);
	}

	// 2. 将活动状态更新为已删除
	const [deletedActivity] = await db
		.update(activities)
		.set({
			status: ActivityStatus.DELETED,
			updatedAt: new Date(),
		})
		.where(eq(activities.id, activityId))
		.returning({
			id: activities.id,
			status: activities.status,
			updatedAt: activities.updatedAt,
		});

	return deletedActivity;
}

// ====================
//  5. 获取活动列表
// ====================
export async function listActivities(filters: {
	status?: ActivityStatusType;
	categoryId?: number;
	startTime?: Date;
	endTime?: Date;
	page?: number;
	pageSize?: number;
	orderBy?: 'startTime' | 'createdAt';
	order?: 'asc' | 'desc';
}) {
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
	const orderByColumn =
		orderBy === 'startTime' ? activities.startTime : activities.createdAt;
	const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
	const offset = (page - 1) * pageSize;

	// 3. 执行查询
	const activityList = await db
		.select({
			id: activities.id,
			title: activities.title,
			description: activities.description,
			startTime: activities.startTime,
			endTime: activities.endTime,
			location: activities.location,
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

	return {
		activities: activityList,
		pagination: {
			current: page,
			pageSize,
			total: count,
			totalPages: Math.ceil(count / pageSize),
		},
	};
}

// ====================
//  6. 更新活动状态
// ====================
export async function updateActivityStatus(
	activityId: number,
	organizerId: number | null, // 修改参数类型，允许为 null
	newStatus: ActivityStatusType,
) {
	// 1. 只检查活动是否存在
	const [existingActivity] = await db
		.select()
		.from(activities)
		.where(eq(activities.id, activityId));

	if (!existingActivity) {
		throw new Error('Activity not found');
	}

	// 2. 验证状态转换的合法性
	const validTransitions: Record<ActivityStatusType, ActivityStatusType[]> = {
		[ActivityStatus.DRAFT]: [ActivityStatus.PUBLISHED, ActivityStatus.DELETED],
		[ActivityStatus.PUBLISHED]: [
			ActivityStatus.CANCELLED,
			ActivityStatus.COMPLETED,
		],
		[ActivityStatus.CANCELLED]: [ActivityStatus.DELETED],
		[ActivityStatus.COMPLETED]: [ActivityStatus.DELETED],
		[ActivityStatus.DELETED]: [],
	};

	const allowedNewStatus =
		validTransitions[existingActivity.status as ActivityStatusType] || [];
	if (!allowedNewStatus.includes(newStatus)) {
		throw new Error('Invalid status transition');
	}

	// 3. 更新活动状态
	const [updatedActivity] = await db
		.update(activities)
		.set({
			status: newStatus,
			updatedAt: new Date(),
		})
		.where(eq(activities.id, activityId))
		.returning({
			id: activities.id,
			status: activities.status,
			updatedAt: activities.updatedAt,
		});

	return updatedActivity;
}

// ====================
//  7. 发布活动
// ====================
export async function publishActivity(activityId: number, organizerId: number) {
	return updateActivityStatus(
		activityId,
		organizerId,
		ActivityStatus.PUBLISHED,
	);
}

// ====================
//  8. 取消发布
// ====================
export async function unpublishActivity(
	activityId: number,
	organizerId: number,
) {
	return updateActivityStatus(
		activityId,
		organizerId,
		ActivityStatus.CANCELLED,
	);
}

/**
 * 获取用户发起的活动列表
 */
export async function getActivitiesByOrganizer(organizerId: number) {
	const result = await db
		.select({
			id: activities.id,
			title: activities.title,
			description: activities.description,
			location: activities.location,
			startTime: activities.startTime,
			endTime: activities.endTime,
			capacity: activities.capacity,
			status: activities.status,
			createdAt: activities.createdAt,
			categoryId: activities.categoryId,
			// 添加报名人数统计
			currentRegistrations: sql<number>`
        COALESCE((
          SELECT COUNT(*)::int
          FROM ${registrations}
          WHERE ${registrations.activityId} = ${activities.id}
          AND ${registrations.status} IN (1, 2)
        ), 0)
      `.as('current_registrations'),
		})
		.from(activities)
		.where(eq(activities.organizerId, organizerId))
		.orderBy(desc(activities.createdAt));

	return result;
}

/**
 * 获取活动状态统计
 */
export async function getActivityStatusCount() {
	const result = await db
		.select({
			status: activities.status,
			count: sql<number>`count(*)`,
		})
		.from(activities)
		.where(sql`${activities.status} != ${ActivityStatus.DELETED}`)
		.groupBy(activities.status);

	return result;
}

/**
 * 获取最近一周活动数量
 */
export async function getRecentActivityCount() {
	const result = await db
		.select({
			date: sql<string>`DATE(${activities.startTime})`,
			count: sql<number>`count(*)`,
		})
		.from(activities)
		.where(
			and(
				sql`${activities.startTime} >= NOW() - INTERVAL '7 days'`,
				sql`${activities.status} != ${ActivityStatus.DELETED}`,
			),
		)
		.groupBy(sql`DATE(${activities.startTime})`)
		.orderBy(sql`DATE(${activities.startTime})`);

	return result;
}

/**
 * 获取热门活动
 */
export async function getPopularActivities(limit = 5) {
	const popularActivities = await db
		.select({
			activityId: activities.id,
			title: activities.title,
			registrationCount: sql<number>`cast(count(${registrations.id}) as integer)`,
		})
		.from(activities)
		.leftJoin(registrations, eq(activities.id, registrations.activityId))
		.where(
			and(
				sql`${activities.status} != ${ActivityStatus.DELETED}`,
				sql`${registrations.status} = ${RegistrationStatus.APPROVED}`,
			),
		)
		.groupBy(activities.id, activities.title)
		.orderBy(desc(sql`count(${registrations.id})`))
		.limit(limit);

	return popularActivities;
}
