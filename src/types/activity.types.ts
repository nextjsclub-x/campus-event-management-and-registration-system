import type { activities } from '@/schema/activity.schema';

// 活动状态类型
export enum ActivityStatus {
	DELETED = 0,    // 已删除
	DRAFT = 1,      // 草稿
	PUBLISHED = 2,  // 已发布
	CANCELLED = 3,  // 已取消
	COMPLETED = 4   // 已完成
}

export type ActivityStatusType =
	(typeof ActivityStatus)[keyof typeof ActivityStatus];

// 活动类型
export type Activity = typeof activities.$inferSelect;

// 活动查询选项接口
export interface GetActivitiesOptions {
	status?: ActivityStatusType;
	categoryId?: number;
	startTime?: Date;
	endTime?: Date;
	page?: number;
	pageSize?: number;
	orderBy?: 'startTime' | 'createdAt';
	order?: 'asc' | 'desc';
}
