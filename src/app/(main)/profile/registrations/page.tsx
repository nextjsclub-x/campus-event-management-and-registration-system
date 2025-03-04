import { headers } from 'next/headers';
import { getUserRegistrations } from '@/models/registration/get-user-registrations';
import { notFound } from 'next/navigation';
import { cancelRegistration } from '@/models/registration/cancel-registration';
import { revalidatePath } from 'next/cache';
import { RegistrationsClient } from './client';

// Server Action: 取消报名
async function handleCancelRegistration(userId: number, activityId: number) {
	'use server';

	await cancelRegistration(userId, activityId);
	revalidatePath('/profile/registrations');
}

export default async function RegistrationsPage() {
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		return notFound();
	}

	try {
		const { registrations } = await getUserRegistrations(Number(userId), {
			page: 1,
			pageSize: 100,
		});

		return (
  <RegistrationsClient
    registrations={registrations}
    onCancelRegistration={handleCancelRegistration}
			/>
		);
	} catch (error) {
		return notFound();
	}
}
