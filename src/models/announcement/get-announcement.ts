import { and, eq, isNull } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

export async function getAnnouncement(id: number): Promise<Announcement> {
	const [announcement] = await db
		.select()
		.from(announcements)
		.where(and(eq(announcements.id, id), isNull(announcements.deletedAt)));

	if (!announcement) {
		throw new Error('公告不存在');
	}

	return announcement;
}
