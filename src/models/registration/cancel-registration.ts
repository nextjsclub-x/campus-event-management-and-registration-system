import { and, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

export async function cancelRegistration(userId: number, activityId: number) {
	// 1. 检查报名记录是否存在
	const [registration] = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.userId, userId),
				eq(registrations.activityId, activityId),
				eq(registrations.status, RegistrationStatus.PENDING),
			),
		);

	if (!registration) {
		throw new Error('Registration not found or cannot be cancelled');
	}

	// 2. 更新报名状态为已取消
	const [updatedRegistration] = await db
		.update(registrations)
		.set({
			status: RegistrationStatus.CANCELLED,
		})
		.where(
			and(
				eq(registrations.userId, userId),
				eq(registrations.activityId, activityId),
			),
		)
		.returning({
			id: registrations.id,
			status: registrations.status,
			registeredAt: registrations.registeredAt,
		});

	return {
		...updatedRegistration,
		statusText: 'Cancelled',
	};
}
