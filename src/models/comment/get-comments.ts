'use server';

import { and, eq, desc, asc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';
import type { Comment } from '@/schema/comment.schema';

interface GetCommentsOptions {
	status?: number;
	userId?: number;
	page?: number;
	limit?: number;
	order?: 'asc' | 'desc';
}

interface CommentListResponse {
	items: Comment[];
	total: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export async function getComments(
	options: GetCommentsOptions = {},
): Promise<CommentListResponse> {
	const { status, userId, page = 1, limit = 10, order = 'desc' } = options;
	const offset = (page - 1) * limit;

	// 1. 构建查询条件
	const conditions = [sql`${comments.deletedAt} IS NULL`];

	// 添加状态过滤条件
	if (typeof status !== 'undefined') {
		conditions.push(eq(comments.status, status));
	}
	// 添加用户ID过滤条件
	if (userId) {
		conditions.push(eq(comments.userId, userId));
	}

	// 2. 查询总记录数
	const [{ count }] = await db
		.select({
			count: sql`count(*)`.mapWith(Number),
		})
		.from(comments)
		.where(and(...conditions));

	// 3. 查询分页数据
	const results = await db
		.select()
		.from(comments)
		.where(and(...conditions))
		.orderBy(
			order === 'desc' ? desc(comments.createdAt) : asc(comments.createdAt),
		)
		.limit(limit)
		.offset(offset);

	const totalPages = Math.ceil(count / limit);

	return {
		items: results,
		total: count,
		totalPages,
		currentPage: page,
		limit,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
}

