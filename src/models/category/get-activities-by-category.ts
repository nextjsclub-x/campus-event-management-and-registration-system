import { eq } from 'drizzle-orm';
import { activities } from '@/schema/activity.schema';
import type { PaginationOptions } from '@/types/pagination.types';
import { checkCategoryExists, getPaginatedQuery, buildActivityFilters, type ActivityFilter } from './utils';

export async function getActivitiesByCategory(
  categoryId: number,
  options: PaginationOptions & { filters?: ActivityFilter } = { page: 1, limit: 10 }
) {
  await checkCategoryExists(categoryId);
  
  const { filters = {} } = options;
  const conditions = [
    eq(activities.categoryId, categoryId),
    ...buildActivityFilters(filters)
  ];

  return getPaginatedQuery<typeof activities.$inferSelect>(
    'activities',
    conditions,
    options
  );
} 
