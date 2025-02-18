import type { feedback } from '@/schema/feedback.schema';

// 反馈类型
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

// 反馈统计类型
export interface FeedbackStats {
	totalCount: number;
	averageRating: number;
	ratingDistribution: {
		[key: number]: number;
	};
}

// 分页类型
export interface PaginationInfo {
	current: number;
	pageSize: number;
	total: number;
	totalPages: number;
}
