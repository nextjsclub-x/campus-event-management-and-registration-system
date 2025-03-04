import { getComments } from '@/models/comment';
import { CommentStatusType } from '@/types/comment.types';
import { CommentsClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CommentsPage() {
	const response = await getComments({
		status: CommentStatusType.APPROVED,
		limit: 50,
		order: 'desc',
	});

	return <CommentsClient comments={response.items} />;
}
