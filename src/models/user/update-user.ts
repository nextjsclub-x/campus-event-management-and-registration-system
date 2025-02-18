'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import type { UserRole } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/utils/password_crypto';

/**
 * 更新用户
 * @param id 用户 ID
 * @param data 要更新的字段（部分/可选）
 * @returns 更新后的用户
 */
export async function updateUser(
  id: number,
  data: {
    email?: string;
    password?: string; // 需要加密
    name?: string;
    role?: UserRole;
    status?: number;
  },
) {
  // 准备一个空对象收集要更新的字段
  const updateData: Partial<{
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    status: number;
    updatedAt: Date;
  }> = {};

  if (data.email !== undefined) {
    updateData.email = data.email;
  }
  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.role !== undefined) {
    updateData.role = data.role;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  // 每次更新都更新 updatedAt
  updateData.updatedAt = new Date();

  // 如果 updateData 为空，会报错，可以做个校验
  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
} 
