import { and, eq, isNull } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

export async function deleteAnnouncement(id: number): Promise<Announcement> {
  const [deletedAnnouncement] = await db.update(announcements)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      and(
        eq(announcements.id, id),
        isNull(announcements.deletedAt)
      )
    )
    .returning();

  if (!deletedAnnouncement) {
    throw new Error('公告不存在或已被删除');
  }

  return deletedAnnouncement;
} 
