'use server';

import {
  createAnnouncement,
  getAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPublishStatus
} from '@/models/announcement.model';
import type { Announcement, NewAnnouncement } from '@/schema/announcement.schema';

// ====================
//  1. 创建公告
// ====================
export async function createAnnouncementService(data: {
  title: string;
  content: string;
  isPublished?: number;
}) {
  return createAnnouncement(data);
}

// ====================
//  2. 获取单个公告
// ====================
export async function getAnnouncementService(id: number) {
  return getAnnouncement(id);
}

// ====================
//  3. 获取公告列表
// ====================
export async function listAnnouncementsService(filters: {
  isPublished?: number;
  page?: number;
  pageSize?: number;
}) {
  return listAnnouncements(filters);
}

// ====================
//  4. 更新公告
// ====================
export async function updateAnnouncementService(
  id: number,
  data: Partial<NewAnnouncement>
) {
  return updateAnnouncement(id, data);
}

// ====================
//  5. 删除公告
// ====================
export async function deleteAnnouncementService(id: number) {
  return deleteAnnouncement(id);
}

// ====================
//  6. 发布/取消发布公告
// ====================
export async function publishAnnouncementService(id: number, isPublished: number) {
  return toggleAnnouncementPublishStatus(id, isPublished);
} 
