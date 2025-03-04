import type { activities } from '@/schema/activity.schema';

export type ActivityStatusType = 1 | 2 | 3 | 4 | 5;

export const ActivityStatus = {
	PENDING: 1, // 待审核
	PUBLISHED: 2, // 已发布
	CANCELLED: 3, // 已取消
	COMPLETED: 4, // 已完成
	DELETED: 5, // 已删除
} as const;

// 基础活动类型
export type Activity = typeof activities.$inferSelect & {
	currentRegistrations?: number;
};

export type NewActivity = typeof activities.$inferInsert;

// 创建活动请求类型
export interface CreateActivityRequest {
	title: string;
	description: string;
	startTime: string; // ISO 格式的日期字符串
	endTime: string; // ISO 格式的日期字符串
	location: string;
	capacity: number;
	categoryId: number;
}

// 活动显示状态类型
export type ActivityDisplayStatus = {
	status: string;
	variant: 'default' | 'secondary' | 'outline' | 'destructive';
};

// 活动状态转换规则
export const ActivityStatusTransitions: {
	[key in ActivityStatusType]: ActivityStatusType[];
} & {
	getDisplayStatus(status: ActivityStatusType): ActivityDisplayStatus;
} = {
	[ActivityStatus.PENDING]: [ActivityStatus.PUBLISHED, ActivityStatus.DELETED],
	[ActivityStatus.PUBLISHED]: [
		ActivityStatus.CANCELLED,
		ActivityStatus.COMPLETED,
	],
	[ActivityStatus.CANCELLED]: [ActivityStatus.DELETED],
	[ActivityStatus.COMPLETED]: [ActivityStatus.DELETED],
	[ActivityStatus.DELETED]: [],
	getDisplayStatus(status: ActivityStatusType): ActivityDisplayStatus {
		switch (status) {
			case ActivityStatus.PENDING:
				return { status: '待审核', variant: 'secondary' };
			case ActivityStatus.PUBLISHED:
				return { status: '报名中', variant: 'default' };
			case ActivityStatus.CANCELLED:
				return { status: '已取消', variant: 'destructive' };
			case ActivityStatus.COMPLETED:
				return { status: '已结束', variant: 'secondary' };
			case ActivityStatus.DELETED:
				return { status: '已删除', variant: 'destructive' };
			default:
				return { status: '未知', variant: 'secondary' };
		}
	},
} as const;

// 活动显示状态工具函数
export function getActivityStatus(activity: Activity) {
	const now = new Date();
	const endTime = new Date(activity.endTime);
	const registrations = activity.currentRegistrations || 0;

	if (activity.status === ActivityStatus.PENDING) {
		return {
			status: ActivityStatusTransitions.getDisplayStatus(
				activity.status as ActivityStatusType,
			),
			isClickable: false,
			className: 'bg-yellow-100 text-yellow-800',
		};
	}

	if (endTime < now) {
		return {
			status: ActivityStatusTransitions.getDisplayStatus(
				ActivityStatus.COMPLETED,
			),
			isClickable: false,
			className: 'bg-gray-100 text-gray-800',
		};
	}

	if (registrations >= activity.capacity) {
		return {
			status: ActivityStatusTransitions.getDisplayStatus(
				ActivityStatus.CANCELLED,
			),
			isClickable: false,
			className: 'bg-orange-100 text-orange-800',
		};
	}

	// 可报名状态
	return {
		status: ActivityStatusTransitions.getDisplayStatus(
			activity.status as ActivityStatusType,
		),
		isClickable: true,
		className: 'bg-green-100 text-green-800',
	};
}

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

