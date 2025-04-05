'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { eq, desc } from 'drizzle-orm';
import { getActivityRegistrations } from '@/models/registration/get-activity-registrations';

// 定义扩展类型 ActivityWithRegistrations
type ActivityWithRegistrations = {
	id: number;
	title: string;
	description: string;
	location: string;
	startTime: Date;
	endTime: Date;
	capacity: number;
	status: number;
	createdAt: Date;
	updatedAt: Date;
	organizerId: number;
	categoryId: number;
	currentRegistrations: number; // 新增字段用于表示报名人数
};

export async function getActivitiesByOrganizer(
	organizerId: number
): Promise<ActivityWithRegistrations[]> {
	// 1. 查询活动列表（不直接计算报名人数）
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
			updatedAt: activities.updatedAt,
			organizerId: activities.organizerId,
			categoryId: activities.categoryId,
		})
		.from(activities)
		.where(eq(activities.organizerId, organizerId))
		.orderBy(desc(activities.createdAt));

	// 2. 使用 Promise.all 并发获取报名人数并扩展结果
	const activitiesWithRegistrations = await Promise.all(
		result.map(async (activity) => {
			// 调用 getActivityRegistrations 方法获取当前活动的报名数据
			const registrationData = await getActivityRegistrations(activity.id);

			// 扩展活动对象，添加报名人数字段
			const activityWithRegistrations: ActivityWithRegistrations = {
				...activity,
				currentRegistrations: registrationData.pagination.total, // 报名人数来自 pagination.total
			};

			return activityWithRegistrations;
		})
	);

	return activitiesWithRegistrations;
}
