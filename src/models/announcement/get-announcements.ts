'use server';

import { and, desc, asc, sql, isNull, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

interface GetAnnouncementsOptions {
	page?: number;
	limit?: number;
	order?: 'asc' | 'desc';
	isPublished?: boolean;
}

interface AnnouncementListResponse {
	items: Announcement[];
	total: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export async function getAnnouncements(
	options: GetAnnouncementsOptions = {},
): Promise<AnnouncementListResponse> {
	const { page = 1, limit = 10, order = 'desc', isPublished } = options;
	const offset = (page - 1) * limit;

	// 构建查询条件
	const conditions = [isNull(announcements.deletedAt)];
	if (typeof isPublished === 'boolean') {
		conditions.push(eq(announcements.isPublished, isPublished ? 1 : 0));
	}

	// 获取总数
	const [{ count }] = await db
		.select({
			count: sql`count(*)`.mapWith(Number),
		})
		.from(announcements)
		.where(and(...conditions));

	// 获取分页数据
	const items = await db
		.select()
		.from(announcements)
		.where(and(...conditions))
		.orderBy(
			order === 'desc'
				? desc(announcements.createdAt)
				: asc(announcements.createdAt),
		)
		.limit(limit)
		.offset(offset);

	const totalPages = Math.ceil(count / limit);

	return {
		items,
		total: count,
		totalPages,
		currentPage: page,
		limit,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
}

