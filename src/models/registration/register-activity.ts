import { and, eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

export async function registerActivity(userId: number, activityId: number) {
  // 1. 检查活动是否存在且状态为已发布
  const [activity] = await db.select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.status, 2) // PUBLISHED 状态
      )
    );

  if (!activity) {
    throw new Error('Activity not found or not available for registration');
  }

  // 2. 检查是否已经报名过
  const [existingRegistration] = await db.select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.PENDING)
      )
    );

  if (existingRegistration) {
    throw new Error('You have already registered for this activity');
  }

  // 3. 检查活动容量
  const [{count}] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.APPROVED)
      )
    );

  const isWaitlist = activity.capacity > 0 && count >= activity.capacity;

  // 4. 创建报名记录
  const [registration] = await db.insert(registrations)
    .values({
      userId,
      activityId,
      status: isWaitlist ? RegistrationStatus.WAITLIST : RegistrationStatus.PENDING,
    })
    .returning({
      id: registrations.id,
      userId: registrations.userId,
      activityId: registrations.activityId,
      status: registrations.status,
      registeredAt: registrations.registeredAt
    });

  return {
    ...registration,
    statusText: isWaitlist ? 'On waitlist' : 'Pending approval'
  };
} 
