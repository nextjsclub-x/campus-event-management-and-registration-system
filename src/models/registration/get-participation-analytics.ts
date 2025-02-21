import { and, eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

// 辅助函数：获取总报名人数
async function getRegistrationCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(eq(registrations.activityId, activityId));
  return count;
}

// 辅助函数：获取实际参与人数
async function getAttendanceCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.ATTENDED)
      )
    );
  return count;
}

// 辅助函数：获取缺席人数
async function getAbsentCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.ABSENT)
      )
    );
  return count;
}

// 辅助函数：获取取消报名人数
async function getCancelledCount(activityId: number): Promise<number> {
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(
      and(
        eq(registrations.activityId, activityId),
        eq(registrations.status, RegistrationStatus.CANCELLED)
      )
    );
  return count;
}

export async function getParticipationAnalytics(activityId: number) {
  // 1. 获取活动信息
  const [activity] = await db.select({
    id: activities.id,
    title: activities.title,
    startTime: activities.startTime,
    endTime: activities.endTime
  })
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取参与情况统计
  const participationStats = {
    registered: await getRegistrationCount(activityId),
    attended: await getAttendanceCount(activityId),
    absent: await getAbsentCount(activityId),
    cancelled: await getCancelledCount(activityId)
  };

  // 3. 计算参与率
  const rates = {
    attendanceRate: participationStats.registered > 0
      ? (participationStats.attended / participationStats.registered * 100).toFixed(2)
      : '0.00',
    absentRate: participationStats.registered > 0
      ? (participationStats.absent / participationStats.registered * 100).toFixed(2)
      : '0.00',
    cancellationRate: participationStats.registered > 0
      ? (participationStats.cancelled / participationStats.registered * 100).toFixed(2)
      : '0.00'
  };

  return {
    activityId,
    activityTitle: activity.title,
    startTime: activity.startTime,
    endTime: activity.endTime,
    stats: participationStats,
    rates
  };
} 
