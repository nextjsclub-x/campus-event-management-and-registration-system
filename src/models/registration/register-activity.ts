import { and, eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

export async function registerActivity(userId: number, activityId: number) {
	// 1. 检查活动是否存在且状态为已发布
	const [activity] = await db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.id, activityId),
				eq(activities.status, 2), // PUBLISHED 状态
			),
		);

	if (!activity) {
		throw new Error('Activity not found or not available for registration');
	}

	// 2. 检查是否已经报名过或被拒绝过
	const [existingRegistration] = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.userId, userId),
				eq(registrations.activityId, activityId),
				sql`status in (${RegistrationStatus.PENDING}, ${RegistrationStatus.REJECTED})`,
			),
		);

	if (existingRegistration) {
		if (existingRegistration.status === RegistrationStatus.PENDING) {
			throw new Error('您已经报名过这个活动了');
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			throw new Error('您的报名申请已被拒绝，不能再次报名');
		}
	}

	// 3. 检查活动容量
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(registrations)
		.where(
			and(
				eq(registrations.activityId, activityId),
				eq(registrations.status, RegistrationStatus.APPROVED),
			),
		);

	const isWaitlist = activity.capacity > 0 && count >= activity.capacity;

	// 4. 创建报名记录
	const [registration] = await db
		.insert(registrations)
		.values({
			userId,
			activityId,
			status: isWaitlist
				? RegistrationStatus.WAITLIST
				: RegistrationStatus.PENDING,
		})
		.returning({
			id: registrations.id,
			userId: registrations.userId,
			activityId: registrations.activityId,
			status: registrations.status,
			registeredAt: registrations.registeredAt,
		});

	return {
		...registration,
		statusText: isWaitlist ? 'On waitlist' : 'Pending approval',
	};
}

