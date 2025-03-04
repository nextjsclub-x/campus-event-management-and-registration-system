import { and, eq, isNull } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

export async function toggleAnnouncementPublishStatus(
	id: number,
	isPublished: number,
): Promise<Announcement> {
	const [updatedAnnouncement] = await db
		.update(announcements)
		.set({
			isPublished,
			updatedAt: new Date(),
		})
		.where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))
		.returning();

	if (!updatedAnnouncement) {
		throw new Error('公告不存在或已被删除');
	}

	return updatedAnnouncement;
}
