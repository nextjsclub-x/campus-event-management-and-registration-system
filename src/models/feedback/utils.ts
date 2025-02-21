import type { feedback } from '@/schema/feedback.schema';

// 内部使用的类型，导出
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

// 反馈统计接口
export interface FeedbackStats {
	totalCount: number;
	averageRating: number;
	ratingDistribution: {
		5: number;
		4: number;
		3: number;
		2: number;
		1: number;
	};
}
