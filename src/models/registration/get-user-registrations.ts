import { and, eq, sql, desc, asc } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { activities } from '@/schema/activity.schema';
import type { RegistrationStatusType } from './utils';
import { getStatusText } from './utils';

export async function getUserRegistrations(
  userId: number,
  options: {
    status?: RegistrationStatusType;
    page?: number;
    pageSize?: number;
    orderBy?: 'registeredAt' | 'status';
    order?: 'asc' | 'desc';
  } = {}
) {
  const {
    status,
    page = 1,
    pageSize = 20,
    orderBy = 'registeredAt',
    order = 'desc'
  } = options;

  // 1. 构建查询条件
  const conditions = [eq(registrations.userId, userId)];
  if (status !== undefined) {
    conditions.push(eq(registrations.status, status));
  }

  // 2. 构建排序表达式
  const orderByColumn = orderBy === 'registeredAt' ? registrations.registeredAt : registrations.status;
  const orderExpr = order === 'desc' ? desc(orderByColumn) : asc(orderByColumn);
  const offset = (page - 1) * pageSize;

  // 3. 执行查询
  const registrationList = await db
    .select({
      id: registrations.id,
      userId: registrations.userId,
      activityId: registrations.activityId,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      activityTitle: activities.title,
      activityStartTime: activities.startTime,
      activityEndTime: activities.endTime,
      activityLocation: activities.location,
    })
    .from(registrations)
    .leftJoin(activities, eq(registrations.activityId, activities.id))
    .where(and(...conditions))
    .orderBy(orderExpr)
    .limit(pageSize)
    .offset(offset);

  // 4. 获取总数
  const [{ count }] = await db
    .select({
      count: sql<number>`cast(count(*) as integer)`
    })
    .from(registrations)
    .where(and(...conditions));

  // 5. 处理状态文本
  const registrationsWithStatus = registrationList.map(registration => ({
    ...registration,
    statusText: getStatusText(registration.status)
  }));

  return {
    registrations: registrationsWithStatus,
    pagination: {
      current: page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize)
    }
  };
} 
