import db from '@/database/neon.db';
import { users, UserRole } from '@/schema/user.schema';
import { eq, sql, isNull, count, gte, lte } from 'drizzle-orm';


import { hashPassword, verifyPassword } from '@/utils/password_crypto';
import { createToken, verifyToken } from '@/utils/jwt/token-utils';
/**
 * 1. 注册用户
 * @param email 用户邮箱
 * @param passwordHash 用户已加密的密码
 * @param name 用户姓名
 * @param role 用户角色，如 'admin' | 'teacher' | 'student'
 * @returns 插入后的用户记录
 */
export async function register(
  email: string,
  passwordHash: string,
  name: string,
  role: UserRole,
  studentId?: string
) {
  // 1. 验证角色是否合法
  if (!['admin', 'teacher', 'student'].includes(role)) {
    throw new Error('Invalid role');
  }

  // 2. 检查邮箱是否被使用
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 3. 直接插入新用户
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role,
      studentId,  // 可选字段，有就插入，没有就是 null
    })
    .returning();

  return newUser;
}

/**
 * 2. 根据用户 ID 获取用户
 * @param id 用户 ID
 * @returns 用户或 undefined
 */
export async function getUserById(id: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user;
}

/**
 * 3. 根据邮箱获取用户
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

/**
 * 4. 获取所有未被软删除的用户
 *    你可以在这里添加分页、排序、筛选参数
 * @returns 用户数组
 */
export async function getUsers(
  filters: any = {},
  pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 },
  status?: number,
  role?: UserRole,
  startDate?: Date,
  endDate?: Date,
  query?: string,
  lastActiveDate?: Date
) {
  // 收集所有查询条件
  const conditions = [isNull(users.deletedAt)];

  // 添加状态过滤
  if (status !== undefined) {
    conditions.push(eq(users.status, status));
  }

  // 添加角色过滤
  if (role) {
    conditions.push(eq(users.role, role));
  }

  // 添加创建时间范围过滤
  if (startDate && endDate) {
    conditions.push(gte(users.createdAt, startDate));
    conditions.push(lte(users.createdAt, endDate));
  }

  // 添加模糊搜索
  if (query) {
    conditions.push(sql`(${users.name} ILIKE ${`%${query}%`} OR ${users.email} ILIKE ${`%${query}%`})`);
  }

  // 添加活跃用户过滤
  if (lastActiveDate) {
    conditions.push(gte(users.updatedAt, lastActiveDate));
  }

  // 构建并执行查询
  const userList = await db
    .select()
    .from(users)
    .where(sql`${conditions.map(c => `(${c})`).join(' AND ')}`)
    .limit(pagination.pageSize)
    .offset((pagination.page - 1) * pagination.pageSize);

  return userList;
}

/**
 * 5. 更新用户
 *    这里提供了一种可选字段更新的示例
 *    你可以根据需要调整要更新的字段
 *
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
    role?: string;
    status?: number;
  }
) {
  // 准备一个空对象收集要更新的字段
  const updateData: Partial<{
    email: string;
    passwordHash: string;
    name: string;
    role: string;
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
    .set(updateData as any)
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
}

/**
 * 6. 软删除用户
 *    将 deletedAt 字段更新为当前时间
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

/**
 * 7. 统计：获取用户总数（这里统计没有被软删除的用户）
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


/**
 * 8. 统计：获取最近一周新增的用户数量
 * @returns number 最近一周新增的用户数量
 */
export async function countUsersAddedLastWeek() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 计算一周前的日期

  const [{ count: userCount }] = await db
    .select({
      count: count(users.id), // 统计用户数量
    })
    .from(users)
    .where(
      sql`${users.createdAt} >= ${oneWeekAgo.toISOString()}` // 过滤一周内的用户
    );

  return userCount; // 返回一周内新增的用户数量
}


/**
 * 9. 统计：获取最近30天新增的用户数量
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
      sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}` // 过滤 30 天内的用户
    );

  return userCount; // 返回 30 天内新增的用户数量
}

/**
 * 10. 统计：获取用户角色分布情况
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
