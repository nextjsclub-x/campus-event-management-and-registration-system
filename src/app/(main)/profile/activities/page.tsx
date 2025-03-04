import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getActivitiesByOrganizer } from '@/models/activity';
import { ActivitiesClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActivitiesPage() {
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		redirect('/login');
	}

	const activities = await getActivitiesByOrganizer(Number(userId));

	return <ActivitiesClient activities={activities} />;
}
