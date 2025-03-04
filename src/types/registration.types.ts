export enum RegistrationStatus {
	CANCELLED = 0, // 已取消
	PENDING = 1, // 待审核
	APPROVED = 2, // 已批准
	REJECTED = 3, // 已拒绝
	WAITLIST = 4, // 候补名单
	ATTENDED = 5, // 已参加
	ABSENT = 6, // 未出席
}

export type RegistrationStatusType = RegistrationStatus;

export interface GetRegistrationsOptions {
	status?: RegistrationStatusType;
	page?: number;
	pageSize?: number;
}

export interface Registration {
	id: number;
	userId: number;
	activityId: number;
	status: RegistrationStatusType;
	remark?: string;
	createdAt: Date;
	updatedAt: Date;
}

// 管理后台报名列表项
export interface AdminRegistrationItem {
	id: number;
	userId: number;
	activityId: number;
	status: RegistrationStatusType;
	registeredAt: Date;
	userName: string;
	userEmail: string;
	activityTitle: string;
	activityStartTime: Date;
}

// 活动报名列表项
export interface ActivityRegistrationItem {
	id: number;
	userId: number;
	activityId: number;
	status: RegistrationStatusType;
	registeredAt: Date;
	userName: string | null;
}

// 用户报名列表项
export interface UserRegistrationItem {
	id: number;
	userId: number;
	activityId: number;
	status: RegistrationStatusType;
	statusText: string;
	registeredAt: Date;
	activityTitle: string | null;
	activityStartTime: Date | null;
	activityEndTime: Date | null;
	activityLocation: string | null;
}

// 分页信息
export interface PaginationInfo {
	current: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

// 管理后台报名列表响应
export interface AdminRegistrationsResponse {
	registrations: AdminRegistrationItem[];
	pagination: PaginationInfo;
}

// 活动报名列表响应
export interface ActivityRegistrationsResponse {
	registrations: ActivityRegistrationItem[];
	pagination: PaginationInfo;
}

// 用户报名列表响应
export interface UserRegistrationsResponse {
	registrations: UserRegistrationItem[];
	pagination: PaginationInfo;
}

// 状态更新返回值
export interface RegistrationStatusUpdateResponse {
	id: number;
	userId: number;
	activityId: number;
	status: RegistrationStatusType;
	registeredAt: Date;
	message: string;
}

// 报名分析数据
export interface RegistrationAnalytics {
	activityId: number;
	activityTitle: string;
	capacity: number;
	stats: {
		total: number;
		approved: number;
		pending: number;
		rejected: number;
		cancelled: number;
		waitlist: number;
		attended: number;
		absent: number;
	};
	rates: {
		approvalRate: number;
		rejectionRate: number;
		cancellationRate: number;
		attendanceRate: number;
	};
}

// 参与度分析数据
export interface ParticipationAnalytics {
	activityId: number;
	activityTitle: string;
	participantStats: {
		total: number;
		active: number;
		inactive: number;
	};
	timeStats: {
		date: string;
		count: number;
	}[];
	demographicStats?: {
		[key: string]: number;
	};
}

export interface DateRange {
	startDate?: Date;
	endDate?: Date;
}
