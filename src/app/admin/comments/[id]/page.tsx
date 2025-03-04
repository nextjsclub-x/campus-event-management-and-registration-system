import { getCommentById } from '@/models/comment/get-comment-by-id';
import { updateCommentStatus } from '@/models/comment/update-comment-status';
import { deleteComment } from '@/models/comment/delete-comment';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { CommentClient } from './client';

// Server Action: 更新评论状态
async function handleUpdateStatus(commentId: number, status: number) {
  'use server';

  await updateCommentStatus(commentId, status);
  revalidatePath('/admin/comments');
}

// Server Action: 删除评论
async function handleDelete(commentId: number) {
  'use server';

  await deleteComment(commentId);
  revalidatePath('/admin/comments');
}

interface PageProps {
  params: { id: string };
}

export default async function CommentPage({ params }: PageProps) {
  const id = Number.parseInt(params.id, 10);

  try {
    const comment = await getCommentById(id);

    if (!comment) {
      return notFound();
    }

    return (
      <CommentClient
        comment={comment}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />
    );
  } catch (error) {
    return notFound();
  }
}

