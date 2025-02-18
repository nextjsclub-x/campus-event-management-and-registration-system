'use server';

import db from '@/database/neon.db';
import { users } from '@/schema/user.schema';
import { sql, count } from 'drizzle-orm';

/**
 * 获取最近一周新增的用户数量
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
      sql`${users.createdAt} >= ${oneWeekAgo.toISOString()}`, // 过滤一周内的用户
    );

  return userCount; // 返回一周内新增的用户数量
} 
