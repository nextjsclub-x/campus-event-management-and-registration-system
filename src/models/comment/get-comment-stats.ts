import { isNull, eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { comments } from '@/schema/comment.schema';

export async function getCommentStats() {
	const [stats] = await db
		.select({
			total: sql<number>`cast(count(*) as integer)`,
			pending: sql<number>`cast(count(*) filter (where ${comments.status} = 0) as integer)`,
			approved: sql<number>`cast(count(*) filter (where ${comments.status} = 1) as integer)`,
			rejected: sql<number>`cast(count(*) filter (where ${comments.status} = 2) as integer)`,
			withdrawn: sql<number>`cast(count(*) filter (where ${comments.status} = 3) as integer)`,
		})
		.from(comments)
		.where(isNull(comments.deletedAt));

	return stats;
}
