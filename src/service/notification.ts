import { and, eq, gt, lt, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from '@/models/registration/utils';

/**
 * 获取用户即将开始的活动提醒
 * @param userId 用户ID
 * @param hours 提前提醒的小时数，默认6小时
 * @returns 即将开始的活动列表
 *
 * 业务规则：
 * 1. 只查询状态为 APPROVED 的报名记录
 * 2. 活动状态必须是 PUBLISHED
 * 3. 活动开始时间在当前时间和（当前时间+hours小时）之间
 * 4. 返回活动的基本信息（标题、开始时间、地点等）
 */
export async function getUpcomingActivityReminders(userId: number, hours = 24) {
	const now = new Date();
	const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

	return db
		.select({
			activityId: activities.id,
			title: activities.title,
			startTime: activities.startTime,
			location: activities.location,
			// 计算距离开始还有多少分钟
			minutesToStart: sql<number>`
      EXTRACT(EPOCH FROM (${activities.startTime}::timestamp - NOW()::timestamp))/60
    `,
		})
		.from(registrations)
		.innerJoin(activities, eq(activities.id, registrations.activityId))
		.where(
			and(
				eq(registrations.userId, userId),
				eq(registrations.status, RegistrationStatus.APPROVED),
				eq(activities.status, 2), // PUBLISHED
				gt(activities.startTime, now),
				lt(activities.startTime, futureTime),
			),
		)
		.orderBy(activities.startTime);
}

