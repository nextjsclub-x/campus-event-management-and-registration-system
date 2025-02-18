import db from '@/database/neon.db';
import { and, eq, sql, type SQL } from 'drizzle-orm';
import { categories } from '@/schema/category.schema';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import type {
	PaginationOptions,
	PaginatedResponse,
} from '@/types/pagination.types';

// 类型定义
type Category = typeof categories.$inferSelect;
type NewCategory = typeof categories.$inferInsert;

interface ActivityFilter {
	status?: number;
	startTime?: Date;
	endTime?: Date;
}

interface QueryOptions<T> {
	page?: number;
	pageSize?: number;
	filters?: T;
}

// 错误常量
const CategoryError = {
	NOT_FOUND: '分类不存在',
	NAME_EXISTS: '分类名称已存在',
} as const;

// 通用工具函数
async function checkCategoryExists(id: number) {
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.id, id));

	if (!category) throw new Error(CategoryError.NOT_FOUND);
	return category;
}

async function checkCategoryNameExists(name: string, excludeId?: number) {
	const query = excludeId
		? and(eq(categories.name, name), sql`${categories.id} != ${excludeId}`)
		: eq(categories.name, name);

	const [category] = await db.select().from(categories).where(query);

	if (category) throw new Error(CategoryError.NAME_EXISTS);
}

async function getPaginatedQuery<T extends Record<string, unknown>>(
	table: string,
	conditions: SQL<unknown>[],
	options: PaginationOptions
): Promise<PaginatedResponse<T>> {
	const { page = 1, limit = 10 } = options;
	const offset = (page - 1) * limit;

	// 获取总数
	const [{ count }] = await db
		.select({ count: sql`count(*)`.mapWith(Number) })
		.from(sql.raw(table))
		.where(and(...conditions));

	// 获取分页数据
	const items = await db
		.select()
		.from(sql.raw(table))
		.where(and(...conditions))
		.limit(limit)
		.offset(offset) as T[];

	const totalPages = Math.ceil(count / limit);

	return {
		items,
		total: count,
		totalPages,
		currentPage: page,
		limit,
		hasNext: page < totalPages,
		hasPrev: page > 1
	};
}

function buildActivityFilters(filters: ActivityFilter) {
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

// ====================
//  1. 获取分类列表
// ====================
export async function getCategories() {
	return db.select().from(categories);
}

// ====================
//  2. 创建分类
// ====================
export async function createCategory(categoryData: NewCategory) {
	await checkCategoryNameExists(categoryData.name);

	const [newCategory] = await db
		.insert(categories)
		.values(categoryData)
		.returning();

	return newCategory;
}

// ====================
//  3. 更新分类
// ====================
export async function updateCategory(
	categoryId: number,
	categoryData: Partial<NewCategory>,
) {
	await checkCategoryExists(categoryId);
	if (categoryData.name) {
		await checkCategoryNameExists(categoryData.name, categoryId);
	}

	await db
		.update(categories)
		.set({
			...categoryData,
			updatedAt: new Date(),
		})
		.where(eq(categories.id, categoryId));

	return { message: 'Category updated successfully' };
}

// ====================
//  4. 获取分类下的活动
// ====================
export async function getActivitiesByCategory(
	categoryId: number,
	options: PaginationOptions & { filters?: ActivityFilter } = { page: 1, limit: 10 }
) {
	await checkCategoryExists(categoryId);
	
	const { filters = {} } = options;
	const conditions = [
		eq(activities.categoryId, categoryId),
		...buildActivityFilters(filters)
	];

	return getPaginatedQuery<typeof activities.$inferSelect>(
		'activities',
		conditions,
		options
	);
}

// ====================
//  5. 设置活动分类
// ====================
export async function setActivityCategory(
	activityId: number,
	categoryId: number,
) {
	const [activity] = await db
		.select()
		.from(activities)
		.where(eq(activities.id, activityId));

	if (!activity) {
		throw new Error('Activity not found');
	}

	await checkCategoryExists(categoryId);

	await db
		.update(activities)
		.set({ categoryId })
		.where(eq(activities.id, activityId));

	return { message: 'Activity category updated successfully' };
}

// ====================
//  6. 获取分类统计数据
// ====================
export async function getCategoryStats(categoryId: number) {
	await checkCategoryExists(categoryId);

	const [stats] = await db
		.select({
			totalActivities: sql`count(*)`.mapWith(Number),
			statusStats: sql`
        json_agg(
          json_build_object(
            'status', status,
            'count', count(*)
          )
        )
      `.mapWith(JSON.parse),
			recentActivities: sql`
        json_agg(
          json_build_object(
            'id', id,
            'title', title,
            'startTime', start_time,
            'status', status
          )
        ) FILTER (WHERE id IN (
          SELECT id FROM activities 
          WHERE category_id = ${categoryId}
          ORDER BY created_at DESC 
          LIMIT 5
        ))
      `.mapWith(JSON.parse),
		})
		.from(activities)
		.where(eq(activities.categoryId, categoryId))
		.groupBy(activities.categoryId);

	return stats;
}

// ====================
//  7. 获取各分类活动数量统计
// ====================
export async function getCategoryActivityCount() {
	return db
		.select({
			categoryId: activities.categoryId,
			categoryName: categories.name,
			count: sql`count(*)`.mapWith(Number),
		})
		.from(activities)
		.leftJoin(categories, eq(activities.categoryId, categories.id))
		.groupBy(activities.categoryId, categories.name);
}

// ====================
//  8. 获取各分类报名人数统计
// ====================
export async function getCategoryRegistrationCount() {
	return db
		.select({
			categoryId: activities.categoryId,
			categoryName: categories.name,
			registrationCount: sql`count(${registrations.id})`.mapWith(Number),
		})
		.from(activities)
		.leftJoin(categories, eq(activities.categoryId, categories.id))
		.leftJoin(registrations, eq(registrations.activityId, activities.id))
		.groupBy(activities.categoryId, categories.name);
}
