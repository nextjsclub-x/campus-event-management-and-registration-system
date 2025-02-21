import type { notifications } from '@/schema/notification.schema';

// 类型定义
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// 通知列表查询过滤条件接口
export interface ListNotificationsFilter {
	isRead?: boolean;
}

// 分页参数接口
export interface Pagination {
	page?: number;
	pageSize?: number;
}

// 分页结果接口
export interface PaginatedNotifications {
	notifications: Notification[];
	total: number;
}
