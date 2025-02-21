import db from '@/database/neon.db';
import { eq, sql } from 'drizzle-orm';
import { activities } from '@/schema/activity.schema';
import { categories } from '@/schema/category.schema';
import { registrations } from '@/schema/registration.schema';

export async function getCategoryRegistrationCount() {
  return db
    .select({
      categoryId: activities.categoryId,
      categoryName: categories.name,
      registrationCount: sql`count(${registrations.id})`.mapWith(Number),
    })
    .from(activities)
    .leftJoin(categories, eq(activities.categoryId, categories.id))
    .leftJoin(registrations, eq(registrations.activityId, activities.id))
    .groupBy(activities.categoryId, categories.name);
} 
