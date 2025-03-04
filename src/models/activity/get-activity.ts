'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { eq, and, sql, or } from 'drizzle-orm';
import { RegistrationStatus } from '@/types/registration.types';

export async function getActivity(activityId: number) {
	// 1. 获取活动基本信息
	const [activity] = await db
		.select()
		.from(activities)
		.where(eq(activities.id, activityId));

	if (!activity) {
		throw new Error('Activity not found');
	}

	// 2. 获取有效报名人数（包括待审核和已批准的）
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(registrations)
		.where(
			and(
				eq(registrations.activityId, activityId),
				or(
					eq(registrations.status, RegistrationStatus.PENDING), // 待审核
					eq(registrations.status, RegistrationStatus.APPROVED), // 已批准
				),
			),
		);

	return {
		...activity,
		currentRegistrations: count,
	};
}

