import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

export async function createAnnouncement(data: {
  title: string;
  content: string;
  isPublished?: number;
}): Promise<Announcement> {
  const [announcement] = await db.insert(announcements)
    .values({
      ...data,
      isPublished: data.isPublished ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return announcement;
} 
