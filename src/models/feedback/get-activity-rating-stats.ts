import { eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import type { FeedbackStats } from './utils';

export async function getActivityRatingStats(
	activityId: number,
): Promise<FeedbackStats> {
	const [stats] = await db
		.select({
			totalCount: sql<number>`cast(count(*) as integer)`,
			averageRating: sql<number>`round(avg(${feedback.rating})::numeric, 1)`,
			// 各分数段的统计
			rating5Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 5) as integer)`,
			rating4Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 4) as integer)`,
			rating3Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 3) as integer)`,
			rating2Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 2) as integer)`,
			rating1Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 1) as integer)`,
		})
		.from(feedback)
		.where(eq(feedback.activityId, activityId));

	return {
		...stats,
		ratingDistribution: {
			5: stats.rating5Count,
			4: stats.rating4Count,
			3: stats.rating3Count,
			2: stats.rating2Count,
			1: stats.rating1Count,
		},
	};
}
