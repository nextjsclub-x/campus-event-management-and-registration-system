'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { isNull, count } from 'drizzle-orm';

/**
 * 获取用户总数（这里统计没有被软删除的用户）
 * @returns number 当前用户数量
 */
export async function countUsers() {
	const [{ count: userCount }] = await db
		.select({
			count: count(users.id), // 使用 Drizzle 的 count 函数
		})
		.from(users)
		.where(isNull(users.deletedAt));

	return userCount; // 直接返回 number 类型
}

