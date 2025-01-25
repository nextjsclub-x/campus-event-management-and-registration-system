/* eslint-disable @typescript-eslint/default-param-last */
import db from '@/database/neon.db';
import { users } from '@/schema/db.schema';
import { and, eq, sql } from 'drizzle-orm';

import { hashPassword, verifyPassword } from '@/utils/password_crypto';
import { createToken, verifyToken } from '@/utils/jwt/token-utils';

// ====================
//  1. 用户注册
// ====================
export async function register(email: string, password: string, name: string, role: string) {
  // 1. 检查邮箱是否已被使用
  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 2. 使用 password_crypto 生成密码 hash
  const passwordHash = await hashPassword(password);

  // 3. 插入新用户
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    name,
    role,
  }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt
  });

  return newUser; // 返回部分信息即可，不要返回密码哈希
}

// ====================
//  2. 用户登录
// ====================
export async function login(email: string, password: string) {
  // 1. 根据 email 查找用户
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error('User not found');
  }

  // 2. 验证密码
  const match = await verifyPassword(user.passwordHash, password);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  // 3. 生成 JWT token
  const token = await createToken({
    id: user.id.toString(),
    username: user.name,
    email: user.email,
    role: user.role
  });

  return { token, userId: user.id, role: user.role };
}

// ====================
//  3. 修改密码
// ====================
export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  // 1. 查找用户
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw new Error('User not found');
  }

  // 2. 验证旧密码
  const isOldCorrect = await verifyPassword(user.passwordHash, oldPassword);
  if (!isOldCorrect) {
    throw new Error('Old password is incorrect');
  }

  // 3. 生成新的密码 hash
  const newHash = await hashPassword(newPassword);
  await db.update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.id, userId));

  return { message: 'Password updated successfully' };
}

// ====================
//  4. 获取用户信息
// ====================
export async function getUserById(id: number) {
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  }).from(users).where(eq(users.id, id));

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

// ====================
//  5. 更新用户基本信息
// ====================
interface UserProfileUpdate {
  name?: string;
  // department?: string; 
  // studentId?: string;
  // phone?: string;
  // 如果需要更多字段，请先在 schema 中添加
}

export async function updateUserProfile(userId: number, profile: UserProfileUpdate) {
  // 在 schema 未新增字段前，只演示更新 name
  await db.update(users)
    .set({
      name: profile.name
    })
    .where(eq(users.id, userId));

  return { message: 'User profile updated successfully' };
}

// ====================
//  6. 管理员：获取用户列表
// ====================
interface ListUsersFilter {
  status?: number;
  role?: string;
}

interface Pagination {
  page?: number;    // 第几页
  pageSize?: number; // 每页多少条
}

export async function listUsers(filters: ListUsersFilter = {}, pagination: Pagination) {
  const { status, role } = filters;
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (page - 1) * pageSize;

  // 1. 收集所有可能的查询条件
  const conditions = [];
  if (typeof status !== 'undefined') {
    conditions.push(eq(users.status, status));
  }
  if (typeof role !== 'undefined') {
    conditions.push(eq(users.role, role));
  }

  // 2. 查询总数
  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined);

  // 3. 查询分页数据
  const results = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(pageSize)
    .offset(offset);

  return {
    users: results,
    total: count
  };
}

// ====================
//  7. 管理员：设置用户状态
// ====================
export async function setUserStatus(userId: number, status: number) {
  await db.update(users)
    .set({ status })
    .where(eq(users.id, userId));

  return { message: 'User status updated successfully' };
}

// ====================
//  8. 管理员：设置用户角色
// ====================
export async function setUserRole(userId: number, role: string) {
  await db.update(users)
    .set({ role })
    .where(eq(users.id, userId));

  return { message: 'User role updated successfully' };
}

/**
 * 更新用户名
 */
export async function updateUserName(userId: number, name: string) {
  await db.update(users)
    .set({ 
      name,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

// ====================
//  9. 验证token
// ====================
export async function validateToken(token: string) {
  try {
    const decoded = await verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// ====================
//  10. 权限验证
// ====================
export async function checkPermission(userId: number, action: string) {
  const [user] = await db.select({
    role: users.role
  }).from(users).where(eq(users.id, userId));

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    return true;
  }

  if (action === 'CREATE_ACTIVITY' && user.role === 'organizer') {
    return true;
  }

  // 其他场景自定义……
  return false;
}
