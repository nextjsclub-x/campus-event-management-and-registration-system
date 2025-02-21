'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations, RegistrationStatus } from '@/schema/registration.schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { ActivityStatus } from '@/types/activity.types';

export async function getPopularActivities(limit = 5) {
  const popularActivities = await db
    .select({
      activityId: activities.id,
      title: activities.title,
      registrationCount: sql<number>`cast(count(${registrations.id}) as integer)`,
    })
    .from(activities)
    .leftJoin(registrations, eq(activities.id, registrations.activityId))
    .where(
      and(
        sql`${activities.status} != ${ActivityStatus.DELETED}`,
        sql`${registrations.status} = ${RegistrationStatus.APPROVED}`,
      ),
    )
    .groupBy(activities.id, activities.title)
    .orderBy(desc(sql`count(${registrations.id})`))
    .limit(limit);

  return popularActivities;
} 
