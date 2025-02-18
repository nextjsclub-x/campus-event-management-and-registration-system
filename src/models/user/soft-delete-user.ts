'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';

/**
 * 软删除用户
 * 将 deletedAt 字段更新为当前时间
 * @param id 用户 ID
 * @returns 被软删除的用户
 */
export async function softDeleteUser(id: number) {
  const [deletedUser] = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return deletedUser;
} 
