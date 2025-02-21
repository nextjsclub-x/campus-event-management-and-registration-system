import type { announcements } from '@/schema/announcement.schema';

// 类型定义
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

// 分页接口
export interface PaginatedAnnouncements {
	announcements: Announcement[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}
