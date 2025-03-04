import db from '@/database/neon.db';
import { eq, sql } from 'drizzle-orm';
import { activities } from '@/schema/activity.schema';
import { checkCategoryExists } from './utils';

export async function getCategoryStats(categoryId: number) {
	await checkCategoryExists(categoryId);

	const [stats] = await db
		.select({
			totalActivities: sql`count(*)`.mapWith(Number),
			statusStats: sql`
        json_agg(
          json_build_object(
            'status', status,
            'count', count(*)
          )
        )
      `.mapWith(JSON.parse),
			recentActivities: sql`
        json_agg(
          json_build_object(
            'id', id,
            'title', title,
            'startTime', start_time,
            'status', status
          )
        ) FILTER (WHERE id IN (
          SELECT id FROM activities 
          WHERE category_id = ${categoryId}
          ORDER BY created_at DESC 
          LIMIT 5
        ))
      `.mapWith(JSON.parse),
		})
		.from(activities)
		.where(eq(activities.categoryId, categoryId))
		.groupBy(activities.categoryId);

	return stats;
}
