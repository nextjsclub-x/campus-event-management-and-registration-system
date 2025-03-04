import db from '@/database/neon.db';
import { and, eq, sql, type SQL } from 'drizzle-orm';
import { categories } from '@/schema/category.schema';
import { activities } from '@/schema/activity.schema';
import type {
	PaginationOptions,
	PaginatedResponse,
} from '@/types/pagination.types';

// 类型定义
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export interface ActivityFilter {
	status?: number;
	startTime?: Date;
	endTime?: Date;
}

export interface QueryOptions<T> {
	page?: number;
	pageSize?: number;
	filters?: T;
}

// 错误常量
export const CategoryError = {
	NOT_FOUND: '分类不存在',
	NAME_EXISTS: '分类名称已存在',
} as const;

// 通用工具函数
export async function checkCategoryExists(id: number) {
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.id, id));

	if (!category) throw new Error(CategoryError.NOT_FOUND);
	return category;
}

export async function checkCategoryNameExists(
	name: string,
	excludeId?: number,
) {
	const query = excludeId
		? and(eq(categories.name, name), sql`${categories.id} != ${excludeId}`)
		: eq(categories.name, name);

	const [category] = await db.select().from(categories).where(query);

	if (category) throw new Error(CategoryError.NAME_EXISTS);
}

export async function getPaginatedQuery<T extends Record<string, unknown>>(
	table: string,
	conditions: SQL<unknown>[],
	options: PaginationOptions,
): Promise<PaginatedResponse<T>> {
	const { page = 1, limit = 10 } = options;
	const offset = (page - 1) * limit;

	const [{ count }] = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(sql.raw(table))
		.where(and(...conditions));

	const items = (await db
		.select()
		.from(sql.raw(table))
		.where(and(...conditions))
		.limit(limit)
		.offset(offset)) as T[];

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

export function buildActivityFilters(filters: ActivityFilter) {
	const conditions = [];
	const { status, startTime, endTime } = filters;

	if (typeof status !== 'undefined') {
		conditions.push(eq(activities.status, status));
	}
	if (startTime) {
		conditions.push(sql`${activities.startTime} >= ${startTime}`);
	}
	if (endTime) {
		conditions.push(sql`${activities.endTime} <= ${endTime}`);
	}

	return conditions;
}
