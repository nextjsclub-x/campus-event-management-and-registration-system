import { sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';

export async function getRegistrationStatusCount(): Promise<
	Array<{
		status: number;
		count: number;
	}>
> {
	const result = await db
		.select({
			status: registrations.status,
			count: sql<number>`count(*)`,
		})
		.from(registrations)
		.groupBy(registrations.status);

	return result;
}

