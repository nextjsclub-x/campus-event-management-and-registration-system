import type { announcements } from '@/schema/announcement.schema';

/**
 * 公告实体类型
 */
export type Announcement = typeof announcements.$inferSelect;

/**
 * 新建公告类型
 */
export type NewAnnouncement = typeof announcements.$inferInsert;

/**
 * 公告列表查询参数
 */
export interface AnnouncementQueryParams {
	isPublished?: boolean;
	page?: number;
	pageSize?: number;
}

/**
 * 创建公告参数
 */
export interface CreateAnnouncementParams {
	title: string;
	content: string;
	isPublished?: number;
}

/**
 * 更新公告参数
 */
export interface UpdateAnnouncementParams {
	title?: string;
	content?: string;
	isPublished?: number;
}

/**
 * 公告列表响应
 */
export interface PaginatedAnnouncements {
	announcements: Announcement[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}
