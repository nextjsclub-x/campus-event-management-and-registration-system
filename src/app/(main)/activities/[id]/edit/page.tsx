import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getActivity } from '@/models/activity/get-activity';
import { getCategories } from '@/models/category/get-categories';
import { updateActivity } from '@/models/activity/update-activity';
import { ActivityEditClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	params: {
		id: string;
	};
}

async function handleUpdate(
	activityId: number,
	organizerId: number,
	data: {
		title: string;
		description: string;
		startTime: Date;
		endTime: Date;
		location: string;
		capacity: number;
		categoryId: number;
	},
) {
	'use server';

	await updateActivity(activityId, organizerId, data);
}

export default async function EditActivityPage({ params }: PageProps) {
	const activityId = Number(params.id);
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		redirect('/login');
	}

	try {
		const activity = await getActivity(activityId);
		const { items: categories } = await getCategories();

		if (activity.organizerId !== Number(userId)) {
			redirect('/');
		}

		return (
  <ActivityEditClient
    activity={activity}
    categories={categories}
    updateAction={handleUpdate}
			/>
		);
	} catch (error) {
		return notFound();
	}
}
