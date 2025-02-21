import { eq, sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { activities } from '@/schema/activity.schema';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

export async function getRegistrationAnalytics(activityId: number) {
  // 1. 获取活动信息
  const [activity] = await db.select({
    id: activities.id,
    title: activities.title,
    capacity: activities.capacity
  })
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 获取各状态的报名统计
  const statusStats = await db.select({
    status: registrations.status,
    count: sql<number>`cast(count(*) as integer)`
  })
    .from(registrations)
    .where(eq(registrations.activityId, activityId))
    .groupBy(registrations.status);

  // 3. 计算各状态人数
  const stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    waitlist: 0,
    attended: 0,
    absent: 0
  };

  for (const { status, count } of statusStats) {
    stats.total += count;
    switch (status) {
      case RegistrationStatus.APPROVED:
        stats.approved = count;
        break;
      case RegistrationStatus.PENDING:
        stats.pending = count;
        break;
      case RegistrationStatus.REJECTED:
        stats.rejected = count;
        break;
      case RegistrationStatus.CANCELLED:
        stats.cancelled = count;
        break;
      case RegistrationStatus.WAITLIST:
        stats.waitlist = count;
        break;
      case RegistrationStatus.ATTENDED:
        stats.attended = count;
        break;
      case RegistrationStatus.ABSENT:
        stats.absent = count;
        break;
      default:
        // 未知状态不计入统计
        break;
    }
  }

  // 4. 计算比率
  const rates = {
    approvalRate: stats.total > 0 ? (stats.approved / stats.total * 100).toFixed(2) : '0.00',
    attendanceRate: stats.approved > 0 ? (stats.attended / stats.approved * 100).toFixed(2) : '0.00',
    capacityUsage: activity.capacity > 0 ? (stats.approved / activity.capacity * 100).toFixed(2) : '100.00'
  };

  return {
    activityId,
    activityTitle: activity.title,
    capacity: activity.capacity,
    stats,
    rates
  };
} 
