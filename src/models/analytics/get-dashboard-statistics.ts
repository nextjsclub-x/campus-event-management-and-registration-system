import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { feedback } from '@/schema/feedback.schema';
import { users } from '@/schema/user.schema';
import { sql } from 'drizzle-orm';
import { RegistrationStatus } from '@/types/registration.types';

export type DashboardStatistics = {
	registrationStats: {
		status: RegistrationStatus;
		count: number;
	}[];
	categoryDistribution: {
		name: string;
		count: number;
	}[];
	activityRatings: {
		rating: number;
		count: number;
	}[];
	topParticipants: {
		name: string;
		participationCount: number;
	}[];
	recentActivityStats: {
		total: number;
		thisWeek: number;
		thisMonth: number;
	};
};

export async function getDashboardStatistics(): Promise<DashboardStatistics> {
	// 获取报名状态统计
	const registrationStats = await db
		.select({
			status: registrations.status,
			count: sql<number>`count(*)`,
		})
		.from(registrations)
		.groupBy(registrations.status);

	// 获取活动类别分布
	const categoryDistribution = await db
		.select({
			categoryId: activities.categoryId,
			count: sql<number>`count(*)`,
		})
		.from(activities)
		.where(
			sql`${activities.startTime} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}`,
		)
		.groupBy(activities.categoryId);

	// 获取活动评分分布
	const activityRatings = await db
		.select({
			rating: feedback.rating,
			count: sql<number>`count(*)`,
		})
		.from(feedback)
		.groupBy(feedback.rating);

	// 获取最活跃的参与者
	const topParticipants = await db
		.select({
			name: users.name,
			participationCount: sql<number>`count(*)`,
		})
		.from(registrations)
		.innerJoin(users, sql`${users.id} = ${registrations.userId}`)
		.where(sql`${registrations.status} = ${RegistrationStatus.APPROVED}`)
		.groupBy(users.id, users.name)
		.orderBy(sql`count(*) desc`)
		.limit(5);

	// 获取最近活动统计
	const now = new Date();
	const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const [recentActivityStats] = await db
		.select({
			total: sql<number>`count(*)`,
			thisWeek: sql<number>`count(case when ${activities.createdAt} >= ${weekStart} then 1 end)`,
			thisMonth: sql<number>`count(case when ${activities.createdAt} >= ${monthStart} then 1 end)`,
		})
		.from(activities);

	return {
		registrationStats: registrationStats.map((stat) => ({
			status: stat.status as RegistrationStatus,
			count: Number(stat.count),
		})),
		categoryDistribution: categoryDistribution.map((cat) => ({
			name: cat.categoryId.toString(), // 这里可能需要额外查询分类名称
			count: Number(cat.count),
		})),
		activityRatings: activityRatings.map((rating) => ({
			rating: rating.rating,
			count: Number(rating.count),
		})),
		topParticipants: topParticipants.map((user) => ({
			name: user.name,
			participationCount: Number(user.participationCount),
		})),
		recentActivityStats: {
			total: Number(recentActivityStats.total),
			thisWeek: Number(recentActivityStats.thisWeek),
			thisMonth: Number(recentActivityStats.thisMonth),
		},
	};
}


