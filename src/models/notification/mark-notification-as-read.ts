'use server';

import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { notifications } from '@/schema/notification.schema';

export async function markNotificationAsRead(notificationId: number) {
	await db
		.update(notifications)
		.set({ isRead: 1 })
		.where(eq(notifications.id, notificationId));

	return { message: 'Notification marked as read successfully' };
}

