import { and, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

export async function rejectRegistration(registrationId: number) {
	// 1. 获取报名信息
	const [registration] = await db
		.select()
		.from(registrations)
		.where(eq(registrations.id, registrationId));

	if (!registration) {
		throw new Error('Registration not found');
	}

	if (registration.status !== RegistrationStatus.PENDING) {
		throw new Error('Registration is not in pending status');
	}

	// 2. 更新状态为拒绝
	const [updatedRegistration] = await db
		.update(registrations)
		.set({
			status: RegistrationStatus.REJECTED,
		})
		.where(eq(registrations.id, registrationId))
		.returning();

	// 3. 如果有候补，将第一个候补转为待审核
	const [waitlistRegistration] = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.activityId, registration.activityId),
				eq(registrations.status, RegistrationStatus.WAITLIST),
			),
		)
		.orderBy(registrations.registeredAt)
		.limit(1);

	if (waitlistRegistration) {
		await db
			.update(registrations)
			.set({
				status: RegistrationStatus.PENDING,
			})
			.where(eq(registrations.id, waitlistRegistration.id));
	}

	return {
		...updatedRegistration,
		message: 'Registration rejected successfully',
	};
}

