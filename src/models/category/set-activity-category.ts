import db from '@/database/neon.db';
import { eq } from 'drizzle-orm';
import { activities } from '@/schema/activity.schema';
import { checkCategoryExists } from './utils';

export async function setActivityCategory(
	activityId: number,
	categoryId: number,
) {
	const [activity] = await db
		.select()
		.from(activities)
		.where(eq(activities.id, activityId));

	if (!activity) {
		throw new Error('Activity not found');
	}

	await checkCategoryExists(categoryId);

	await db
		.update(activities)
		.set({ categoryId })
		.where(eq(activities.id, activityId));

	return { message: 'Activity category updated successfully' };
}
