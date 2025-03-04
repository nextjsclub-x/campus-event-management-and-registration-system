'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { sql, count } from 'drizzle-orm';

/**
 * 获取最近30天新增的用户数量
 * @returns number 最近30天新增的用户数量
 */
export async function countUsersAddedLast30Days() {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // 计算 30 天前的日期

	const [{ count: userCount }] = await db
		.select({
			count: count(users.id), // 统计用户数量
		})
		.from(users)
		.where(
			sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}`, // 过滤 30 天内的用户
		);

	return userCount; // 返回 30 天内新增的用户数量
}

