'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { eq, and } from 'drizzle-orm';
import { ActivityStatus } from '@/types/activity.types';

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
