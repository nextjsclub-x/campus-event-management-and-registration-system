'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { eq } from 'drizzle-orm';
import {
	ActivityStatus,
	type ActivityStatusType,
} from '@/types/activity.types';

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
		[ActivityStatus.PENDING]: [
			ActivityStatus.PUBLISHED,
			ActivityStatus.DELETED,
		], // 待审核可以转为发布或删除
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

