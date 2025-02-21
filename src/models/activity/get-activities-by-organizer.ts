'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getActivitiesByOrganizer(organizerId: number) {
  const result = await db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      location: activities.location,
      startTime: activities.startTime,
      endTime: activities.endTime,
      capacity: activities.capacity,
      status: activities.status,
      createdAt: activities.createdAt,
      categoryId: activities.categoryId,
      // 添加报名人数统计
      currentRegistrations: sql<number>`
        COALESCE((
          SELECT COUNT(*)::int
          FROM ${registrations}
          WHERE ${registrations.activityId} = ${activities.id}
          AND ${registrations.status} IN (1, 2)
        ), 0)
      `.as('current_registrations'),
    })
    .from(activities)
    .where(eq(activities.organizerId, organizerId))
    .orderBy(desc(activities.createdAt));

  return result;
} 
