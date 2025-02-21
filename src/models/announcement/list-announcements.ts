import { and, eq, isNull, desc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import type { PaginatedAnnouncements } from './utils';

export async function listAnnouncements(filters: {
  isPublished?: number;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedAnnouncements> {
  const {
    isPublished,
    page = 1,
    pageSize = 10
  } = filters;

  // 构建查询条件
  const conditions = [isNull(announcements.deletedAt)];
  if (typeof isPublished !== 'undefined') {
    conditions.push(eq(announcements.isPublished, isPublished));
  }

  // 执行分页查询
  const announcementList = await db.select()
    .from(announcements)
    .where(and(...conditions))
    .orderBy(desc(announcements.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // 获取总数
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(announcements)
    .where(and(...conditions));

  return {
    announcements: announcementList,
    pagination: {
      current: page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize)
    }
  };
} 
