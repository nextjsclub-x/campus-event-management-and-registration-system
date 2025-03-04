import db from '@/database/neon.db';
import { eq, sql } from 'drizzle-orm';
import { activities } from '@/schema/activity.schema';
import { categories } from '@/schema/category.schema';

export async function getCategoryActivityCount() {
	return db
		.select({
			categoryId: activities.categoryId,
			categoryName: categories.name,
			count: sql`count(*)`.mapWith(Number),
		})
		.from(activities)
		.leftJoin(categories, eq(activities.categoryId, categories.id))
		.groupBy(activities.categoryId, categories.name);
}
