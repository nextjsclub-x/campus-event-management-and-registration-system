'use server';

import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { Comment } from './utils';

/**
 * 获取评论详情
 * @param id - 评论ID
 * @throws Error - 当评论不存在时抛出错误
 * @returns 返回评论详情
 */
export async function getCommentById(id: number): Promise<Comment> {
	const [comment] = await db.select().from(comments).where(eq(comments.id, id));

	if (!comment) {
		throw new Error('评论不存在');
	}

	return comment;
}

