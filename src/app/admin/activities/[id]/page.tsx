import { getActivity } from '@/models/activity';
import { updateActivityStatus } from '@/models/activity/update-activity-status';
import type { Activity, ActivityStatusType } from '@/types/activity.types';
import { notFound } from 'next/navigation';
import { ActivityClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	params: { id: string };
}

async function handleUpdate(
	id: number,
	status: ActivityStatusType,
	reason: string,
): Promise<Activity> {
	'use server';

	const activity = await updateActivityStatus(id, null, status);
	return {
		...activity,
		currentRegistrations: 0, // 这里我们不需要实时的报名人数，因为状态更新后会刷新页面
	} as Activity;
}

export default async function ActivityPage({ params }: PageProps) {
	const activityId = Number.parseInt(params.id, 10);

	try {
		const activity = await getActivity(activityId);
		return (
  <div className='p-6'>
    <ActivityClient activity={activity}
      updateAction={handleUpdate} />
  </div>
		);
	} catch (error) {
		return notFound();
	}
}
