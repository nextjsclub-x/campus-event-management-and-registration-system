'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { ActivityStatus } from '@/types/activity.types';

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
			status: ActivityStatus.PENDING, // 默认为待发布状态
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
