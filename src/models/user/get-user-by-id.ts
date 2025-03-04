'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';

/**
 * 根据用户 ID 获取用户
 * @param id 用户 ID
 * @returns 用户或 undefined
 */
export async function getUserById(id: number) {
	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return user;
}

