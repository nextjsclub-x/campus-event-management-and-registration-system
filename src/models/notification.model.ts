import db from '@/database/neon.db';
import { notifications } from '@/schema/db.schema';
import { and, eq, desc, sql } from 'drizzle-orm';

// ====================
//  系统通知
// ====================

// 创建通知
export async function createNotification(userId: number, activityId: number, message: string) {
  const [notification] = await db.insert(notifications).values({
    userId: userId as number,
    activityId: activityId as number,
    message,
    isRead: 0,
    createdAt: new Date()
  }).returning({
    id: notifications.id,
    userId: notifications.userId,
    activityId: notifications.activityId,
    message: notifications.message,
    isRead: notifications.isRead,
    createdAt: notifications.createdAt
  });

  return notification;
}

// 获取用户通知
interface ListNotificationsFilter {
  isRead?: boolean;
}

interface Pagination {
  page?: number;
  pageSize?: number;
}

export async function getUserNotifications(userId: number, filters: ListNotificationsFilter = {}, pagination: Pagination = {}) {
  const { isRead } = filters;
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (page - 1) * pageSize;

  // 1. 收集查询条件
  const conditions = [eq(notifications.userId, userId)];
  if (typeof isRead !== 'undefined') {
    conditions.push(eq(notifications.isRead, isRead ? 1 : 0));
  }

  // 2. 查询总数
  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(notifications)
    .where(and(...conditions));

  // 3. 查询分页数据
  const results = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    notifications: results,
    total: count
  };
}

// 标记通知已读
export async function markNotificationAsRead(notificationId: number) {
  await db.update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.id, notificationId));

  return { message: 'Notification marked as read successfully' };
}
