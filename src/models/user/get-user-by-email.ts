'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';

/**
 * 根据邮箱获取用户
 * @param email 用户邮箱
 * @returns 用户或 undefined
 */
export async function getUserByEmail(email: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	return user;
}

