import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';
import { checkRegistrationCapacity } from './check-registration-capacity';

export async function approveRegistration(registrationId: number) {
	// 1. 获取报名信息
	const [registration] = await db
		.select({
			id: registrations.id,
			activityId: registrations.activityId,
			status: registrations.status,
		})
		.from(registrations)
		.where(eq(registrations.id, registrationId));

	if (!registration) {
		throw new Error('Registration not found');
	}

	if (registration.status !== RegistrationStatus.PENDING) {
		throw new Error('Registration is not in pending status');
	}

	// 2. 检查活动容量
	const capacityInfo = await checkRegistrationCapacity(registration.activityId);

	// 如果活动已满，将状态设为候补
	if (capacityInfo.isFull) {
		const [updatedRegistration] = await db
			.update(registrations)
			.set({
				status: RegistrationStatus.WAITLIST,
			})
			.where(eq(registrations.id, registrationId))
			.returning();

		return {
			...updatedRegistration,
			message: 'Added to waitlist due to full capacity',
		};
	}

	// 3. 批准报名
	const [updatedRegistration] = await db
		.update(registrations)
		.set({
			status: RegistrationStatus.APPROVED,
		})
		.where(eq(registrations.id, registrationId))
		.returning();

	return {
		...updatedRegistration,
		message: 'Registration approved successfully',
	};
}

