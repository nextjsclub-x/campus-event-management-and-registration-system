'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/utils/password_crypto';

class RegisterError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

/**
 * 注册用户
 * @param email 用户邮箱
 * @param password 用户密码（未加密）
 * @param name 用户姓名
 * @param studentId 学号
 * @returns 插入后的用户记录
 */
export async function register(
  email: string,
  password: string,
  name: string,
  studentId: string,
) {
  // 1. 检查邮箱是否被使用
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser) {
    throw new RegisterError('该邮箱已被注册', 409);
  }

  // 2. 加密密码
  const passwordHash = await hashPassword(password);

  // 3. 插入新用户
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role: 'student',
      studentId,
    })
    .returning();

  return newUser;
} 
