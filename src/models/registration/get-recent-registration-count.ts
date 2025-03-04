import { sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { activities } from '@/schema/activity.schema';

export async function getRecentRegistrationCount(): Promise<
	Array<{
		date: string;
		count: number;
	}>
> {
	const result = await db
		.select({
			date: sql<string>`DATE(${activities.startTime})`,
			count: sql<number>`count(${registrations.id})`,
		})
		.from(registrations)
		.leftJoin(activities, sql`${activities.id} = ${registrations.activityId}`)
		.where(sql`${activities.startTime} >= NOW() - INTERVAL '7 days'`)
		.groupBy(sql`DATE(${activities.startTime})`)
		.orderBy(sql`DATE(${activities.startTime})`);

	return result;
}
