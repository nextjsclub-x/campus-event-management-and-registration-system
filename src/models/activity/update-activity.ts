'use server';

import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { eq, and } from 'drizzle-orm';

export async function updateActivity(
  activityId: number,
  organizerId: number,
  activityData: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
    capacity?: number;
    categoryId?: number;
  },
) {
  // 1. 检查活动是否存在且属于该组织者
  const [existingActivity] = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.organizerId, organizerId),
      ),
    );

  if (!existingActivity) {
    throw new Error(
      'Activity not found or you do not have permission to update it',
    );
  }

  // 2. 更新活动信息
  const [updatedActivity] = await db
    .update(activities)
    .set({
      ...activityData,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      categoryId: activities.categoryId,
      location: activities.location,
      startTime: activities.startTime,
      endTime: activities.endTime,
      capacity: activities.capacity,
      status: activities.status,
      updatedAt: activities.updatedAt,
    });

  return updatedActivity;
} 
