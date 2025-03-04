import { headers } from 'next/headers';
import { createComment } from '@/models/comment/create-comment';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CreateCommentClient } from './client';

// Server Action: 创建留言
async function handleCreate(data: {
	title: string;
	content: string;
}) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		throw new Error('未登录');
	}

	await createComment({
		userId: Number(userId),
		title: data.title,
		content: data.content,
	});

	revalidatePath('/comments');
	redirect('/comments');
}

export default function CreateCommentPage() {
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		redirect('/login');
	}

	return (
  <div className='p-6 w-full'>
    <CreateCommentClient createAction={handleCreate} />
  </div>
	);
}
