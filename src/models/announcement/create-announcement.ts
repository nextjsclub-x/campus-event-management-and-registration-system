'use server';

import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

interface CreateAnnouncementData {
	title: string;
	content: string;
	isPublished?: boolean;
}

export async function createAnnouncement(
	data: CreateAnnouncementData,
): Promise<Announcement> {
	const [announcement] = await db
		.insert(announcements)
		.values({
			title: data.title,
			content: data.content,
			isPublished: data.isPublished ? 1 : 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	return announcement;
}

