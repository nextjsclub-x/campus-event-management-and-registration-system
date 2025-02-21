'use server'

import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { notifications } from '@/schema/notification.schema';
import type { Notification } from './utils';

export async function getNotificationById(notificationId: number): Promise<Notification> {
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, notificationId));

  if (!notification) {
    throw new Error('通知不存在');
  }

  return notification;
} 
