import { eq, desc, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import { users } from '@/schema/user.schema';

export async function getActivityFeedbacks(
	activityId: number,
	page = 1,
	pageSize = 20,
) {
	const offset = (page - 1) * pageSize;

	// 1. 获取反馈列表
	const feedbacks = await db
		.select({
			id: feedback.id,
			rating: feedback.rating,
			comment: feedback.comment,
			createdAt: feedback.createdAt,
			userId: feedback.userId,
			userName: users.name,
		})
		.from(feedback)
		.leftJoin(users, eq(feedback.userId, users.id))
		.where(eq(feedback.activityId, activityId))
		.orderBy(desc(feedback.createdAt))
		.limit(pageSize)
		.offset(offset);

	// 2. 获取总数
	const [{ count }] = await db
		.select({
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(feedback)
		.where(eq(feedback.activityId, activityId));

	// 3. 计算平均评分
	const [{ avgRating }] = await db
		.select({
			avgRating: sql<number>`round(avg(${feedback.rating})::numeric, 1)`,
		})
		.from(feedback)
		.where(eq(feedback.activityId, activityId));

	return {
		feedbacks,
		stats: {
			totalCount: count,
			averageRating: avgRating || 0,
		},
		pagination: {
			current: page,
			pageSize,
			total: count,
			totalPages: Math.ceil(count / pageSize),
		},
	};
}

