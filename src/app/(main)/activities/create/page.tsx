import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCategories } from '@/models/category';
import { createActivity } from '@/models/activity/create-activity';
import { CreateActivityClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function handleCreate(data: {
	title: string;
	description: string;
	startTime: Date;
	endTime: Date;
	location: string;
	capacity: number;
	categoryId: number;
}) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		redirect('/login');
	}

	await createActivity(Number(userId), data);
}

export default async function CreateActivityPage() {
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		redirect('/login');
	}

	const { items: categories } = await getCategories();

	return (
  <CreateActivityClient
    categories={categories}
    userId={Number(userId)}
    createAction={handleCreate}
		/>
	);
}
