'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { sql, and } from 'drizzle-orm';
import { ActivityStatus } from '@/types/activity.types';

export async function getRecentActivityCount() {
	const result = await db
		.select({
			date: sql<string>`DATE(${activities.startTime})`,
			count: sql<number>`count(*)`,
		})
		.from(activities)
		.where(
			and(
				sql`${activities.startTime} >= NOW() - INTERVAL '7 days'`,
				sql`${activities.status} != ${ActivityStatus.DELETED}`,
			),
		)
		.groupBy(sql`DATE(${activities.startTime})`)
		.orderBy(sql`DATE(${activities.startTime})`);

	return result;
}

