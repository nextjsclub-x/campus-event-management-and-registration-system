'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { count } from 'drizzle-orm';

/**
 * 获取用户角色分布情况
 * @returns 返回一个包含每个角色及其对应用户数量的数组
 */
export async function getUserRoleDistribution() {
	const roleDistribution = await db
		.select({
			role: users.role,
			count: count(users.id),
		})
		.from(users)
		.groupBy(users.role);

	return roleDistribution;
}

