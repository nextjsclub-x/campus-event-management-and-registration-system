import { and, eq, isNull } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { Announcement } from './utils';

export async function updateAnnouncement(
  id: number,
  data: {
    title?: string;
    content?: string;
    isPublished?: number;
  }
): Promise<Announcement> {
  // 检查公告是否存在
  const [existingAnnouncement] = await db.select()
    .from(announcements)
    .where(
      and(
        eq(announcements.id, id),
        isNull(announcements.deletedAt)
      )
    );

  if (!existingAnnouncement) {
    throw new Error('公告不存在');
  }

  // 更新公告
  const [updatedAnnouncement] = await db.update(announcements)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(announcements.id, id))
    .returning();

  return updatedAnnouncement;
} 
