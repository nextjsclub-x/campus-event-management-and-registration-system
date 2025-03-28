'use server';

import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';

/**
 * 软删除评论
 * @param id - 评论ID
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回成功消息
 */
export async function deleteComment(id: number) {
	const [comment] = await db
		.update(comments)
		.set({
			deletedAt: new Date(), // 设置删除时间，实现软删除
			updatedAt: new Date(),
		})
		.where(eq(comments.id, id))
		.returning();

	if (!comment) {
		throw new Error('评论不存在');
	}

	return { message: '评论删除成功' };
}
