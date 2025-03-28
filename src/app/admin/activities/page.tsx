import { listActivities } from '@/models/activity';
import type { ActivityStatusType } from '@/types/activity.types';
import { ActivitiesClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	searchParams: { status?: string; page?: string };
}

async function handleStatusChange(newStatus: ActivityStatusType | undefined) {
	'use server';

	return newStatus;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
	const status = searchParams.status
		? (Number.parseInt(searchParams.status, 10) as ActivityStatusType)
		: undefined;

	const currentPage = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;

	const { items: activities, total, totalPages } = await listActivities({
		status,
		page: currentPage,
		pageSize: 10,
		orderBy: 'id',
		order: 'desc',
	});

	return (
		<div className='p-6'>
			<ActivitiesClient
				activities={activities}
				onStatusChange={handleStatusChange}
				currentStatus={status}
				currentPage={currentPage}
				totalPages={totalPages}
				total={total}
			/>
		</div>
	);
}
