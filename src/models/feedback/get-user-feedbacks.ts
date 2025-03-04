import { eq, desc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import { activities } from '@/schema/activity.schema';

export async function getUserFeedbacks(
	userId: number,
	page = 1,
	pageSize = 20,
) {
	const offset = (page - 1) * pageSize;

	const feedbacks = await db
		.select({
			id: feedback.id,
			rating: feedback.rating,
			comment: feedback.comment,
			createdAt: feedback.createdAt,
			activityId: feedback.activityId,
			activityTitle: activities.title,
		})
		.from(feedback)
		.leftJoin(activities, eq(feedback.activityId, activities.id))
		.where(eq(feedback.userId, userId))
		.orderBy(desc(feedback.createdAt))
		.limit(pageSize)
		.offset(offset);

	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(feedback)
		.where(eq(feedback.userId, userId));

	return {
		feedbacks,
		pagination: {
			current: page,
			pageSize,
			total: count,
			totalPages: Math.ceil(count / pageSize),
		},
	};
}

