'use server';

import db from '@/database/neon.db';
import { notifications } from '@/schema/notification.schema';
import type { Notification } from './utils';

export async function createNotification(
	userId: number,
	activityId: number,
	message: string,
): Promise<Notification> {
	const [notification] = await db
		.insert(notifications)
		.values({
			userId: userId as number,
			activityId: activityId as number,
			message,
			isRead: 0,
			createdAt: new Date(),
		})
		.returning({
			id: notifications.id,
			userId: notifications.userId,
			activityId: notifications.activityId,
			message: notifications.message,
			isRead: notifications.isRead,
			createdAt: notifications.createdAt,
		});

	return notification;
}
