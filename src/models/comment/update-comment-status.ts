import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { Comment } from '@/schema/comment.schema';
import type { CommentStatusType } from '@/types/comment.types';

/**
 * 更新评论状态
 * @param id - 评论ID
 * @param status - 新的评论状态
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回更新后的评论对象
 */
export async function updateCommentStatus(
	id: number,
	status: CommentStatusType,
): Promise<Comment> {
	const [comment] = await db
		.update(comments)
		.set({
			status,
			updatedAt: new Date(),
		})
		.where(eq(comments.id, id))
		.returning();

	if (!comment) {
		throw new Error('评论不存在');
	}

	return comment;
}

