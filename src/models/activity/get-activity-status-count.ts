'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { sql } from 'drizzle-orm';
import { ActivityStatus } from '@/types/activity.types';

export async function getActivityStatusCount() {
	const result = await db
		.select({
			status: activities.status,
			count: sql<number>`count(*)`,
		})
		.from(activities)
		.where(sql`${activities.status} != ${ActivityStatus.DELETED}`)
		.groupBy(activities.status);

	return result;
}
