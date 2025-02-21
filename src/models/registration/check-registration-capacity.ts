import { eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import type { CapacityInfo } from './utils';
import { RegistrationStatus } from './utils';

export async function checkRegistrationCapacity(activityId: number): Promise<CapacityInfo> {
  // 1. 获取活动信息
  const [activity] = await db.select({
    id: activities.id,
    capacity: activities.capacity
  })
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取各状态的报名人数
  const statusCounts = await db.select({
    status: registrations.status,
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(eq(registrations.activityId, activityId))
    .groupBy(registrations.status);

  // 3. 统计各状态人数
  const counts = {
    approved: 0,
    pending: 0,
    waitlist: 0
  };

  for (const { status, count } of statusCounts) {
    if (status === RegistrationStatus.APPROVED) counts.approved = count;
    if (status === RegistrationStatus.PENDING) counts.pending = count;
    if (status === RegistrationStatus.WAITLIST) counts.waitlist = count;
  }

  // 4. 计算可用名额
  const available = activity.capacity > 0 
    ? Math.max(0, activity.capacity - counts.approved)
    : Number.MAX_SAFE_INTEGER;

  return {
    activityId,
    capacity: activity.capacity,
    approved: counts.approved,
    pending: counts.pending,
    waitlist: counts.waitlist,
    available,
    isFull: available === 0
  };
} 
