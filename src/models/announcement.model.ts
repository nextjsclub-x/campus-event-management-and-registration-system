import db from '@/database/neon.db';
import { announcements } from '@/schema/announcement.schema';
import { eq, and, desc, isNull, sql } from 'drizzle-orm';

// ====================
//  1. 创建公告
// ====================
export async function createAnnouncement(data: {
  title: string;
  content: string;
  isPublished?: number;
}) {
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

// ====================
//  2. 获取单个公告
// ====================
export async function getAnnouncement(id: number) {
  const [announcement] = await db.select()
    .from(announcements)
    .where(
      and(
        eq(announcements.id, id),
        isNull(announcements.deletedAt)
      )
    );

  if (!announcement) {
    throw new Error('公告不存在');
  }

  return announcement;
}

// ====================
//  3. 获取公告列表
// ====================
export async function listAnnouncements(filters: {
  isPublished?: number;
  page?: number;
  pageSize?: number;
}) {
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

// ====================
//  4. 更新公告
// ====================
export async function updateAnnouncement(
  id: number,
  data: {
    title?: string;
    content?: string;
    isPublished?: number;
  }
) {
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

// ====================
//  5. 软删除公告
// ====================
export async function deleteAnnouncement(id: number) {
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

// ====================
//  6. 发布/取消发布公告
// ====================
export async function toggleAnnouncementPublishStatus(id: number, isPublished: number) {
  const [updatedAnnouncement] = await db.update(announcements)
    .set({
      isPublished,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(announcements.id, id),
        isNull(announcements.deletedAt)
      )
    )
    .returning();

  if (!updatedAnnouncement) {
    throw new Error('公告不存在或已被删除');
  }

  return updatedAnnouncement;
} 
