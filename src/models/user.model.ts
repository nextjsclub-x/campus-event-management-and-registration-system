import db from '@/database/neon.db';
import { users, registrations } from '@/schema/db.schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 获取用户列表及其活动统计
 */
export async function getUsersWithActivityStats() {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      // 统计用户参与的活动数量
      activityCount: sql<number>`
        COALESCE((
          SELECT COUNT(DISTINCT ${registrations.activityId})::int
          FROM ${registrations}
          WHERE ${registrations.userId} = ${users.id}
          AND ${registrations.status} = 2  -- 只统计已批准的报名
        ), 0)
      `.as('activity_count')
    })
    .from(users)
    .where(eq(users.status, 1))  // 只获取正常状态的用户
    .orderBy(users.createdAt);

  return result;
} 
