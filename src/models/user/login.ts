'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/utils/password_crypto';
import { createToken } from '@/utils/jwt/token-utils';
import { cookies } from 'next/headers';

/**
 * 用户登录
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns 登录成功返回token和用户信息，失败抛出错误
 */
export async function login(email: string, password: string) {
  // 1. 查找用户
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 2. 验证密码
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('密码错误');
  }

  // 3. 生成 JWT
  const tokenPayload = {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    studentId: user.studentId,
  };
  const token = await createToken(tokenPayload);

  // 4. 设置 cookie
  const cookieStore = cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365天
    path: '/',
  });

  // 5. 返回token和用户信息
  return { token, user };
} 
