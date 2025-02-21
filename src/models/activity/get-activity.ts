'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { eq, and, sql } from 'drizzle-orm';

export async function getActivity(activityId: number) {
  // 1. 获取活动基本信息
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取已批准的报名人数
  const [{ count }] = await db
    .select({
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, 2), // 只统计已批准的
      ),
    );

  return {
    ...activity,
    currentRegistrations: count,
  };
} 
