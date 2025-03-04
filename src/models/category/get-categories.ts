'use server';

import { desc, asc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { categories } from '@/schema/category.schema';
import type { Category } from '@/schema/category.schema';

interface GetCategoriesOptions {
	page?: number;
	limit?: number;
	order?: 'asc' | 'desc';
}

interface CategoryListResponse {
	items: Category[];
	total: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export async function getCategories(
	options: GetCategoriesOptions = {},
): Promise<CategoryListResponse> {
	const { page = 1, limit = 10, order = 'desc' } = options;
	const offset = (page - 1) * limit;

	// 获取总数
	const [{ count }] = await db
		.select({
			count: sql`count(*)`.mapWith(Number),
		})
		.from(categories);

	// 获取分页数据
	const items = await db
		.select()
		.from(categories)
		.orderBy(
			order === 'desc' ? desc(categories.createdAt) : asc(categories.createdAt),
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

