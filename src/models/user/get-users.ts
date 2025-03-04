'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import type { UserRole } from '@/schema/user.schema';
import { eq, sql, isNull, count, gte, lte, and, desc } from 'drizzle-orm';
import type {
	PaginationOptions,
	PaginatedResponse,
} from '@/types/pagination.types';

/**
 * 获取所有未被软删除的用户
 * @param options 分页和过滤选项
 * @returns 分页后的用户数组和分页信息
 */
export async function getUsers(
	options: PaginationOptions & {
		status?: number;
		role?: UserRole;
		startDate?: Date;
		endDate?: Date;
		lastActiveDate?: Date;
	},
): Promise<PaginatedResponse<typeof users.$inferSelect>> {
	const {
		page = 1,
		limit = 10,
		keyword: query,
		status,
		role,
		startDate,
		endDate,
		lastActiveDate,
	} = options;

	// 收集所有查询条件
	const conditions = [isNull(users.deletedAt)];

	// 添加状态过滤
	if (status !== undefined) {
		conditions.push(eq(users.status, status));
	}

	// 添加角色过滤
	if (role) {
		conditions.push(eq(users.role, role));
	}

	// 添加创建时间范围过滤
	if (startDate && endDate) {
		conditions.push(gte(users.createdAt, startDate));
		conditions.push(lte(users.createdAt, endDate));
	}

	// 添加模糊搜索
	if (query) {
		conditions.push(
			sql`(${users.name} ILIKE ${`%${query}%`} OR ${users.email} ILIKE ${`%${query}%`})`,
		);
	}

	// 添加活跃用户过滤
	if (lastActiveDate) {
		conditions.push(gte(users.updatedAt, lastActiveDate));
	}

	// 获取总数
	const [{ count: total }] = await db
		.select({ count: count(users.id) })
		.from(users)
		.where(and(...conditions));

	// 构建并执行查询
	const items = await db
		.select()
		.from(users)
		.where(and(...conditions))
		.orderBy(desc(users.createdAt)) // 按创建时间倒序排序
		.limit(limit)
		.offset((page - 1) * limit);

	const totalPages = Math.ceil(total / limit);

	return {
		items,
		total,
		totalPages,
		currentPage: page,
		limit,
		hasNext: page < totalPages,
		hasPrev: page > 1,
	};
}

