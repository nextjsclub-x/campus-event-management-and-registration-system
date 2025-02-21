import { sql } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import { RegistrationStatus } from './utils';

interface RegistrationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  waitlist: number;
  attended: number;
  absent: number;
}

/**
 * 获取活动报名统计信息
 * @param activityId - 活动ID
 * @returns 返回报名统计信息
 */
export async function getRegistrationStats(activityId: number): Promise<RegistrationStats> {
  const [result] = await db
    .select({
      total: sql<number>`count(*)`,
      approved: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.APPROVED} then 1 else 0 end)`,
      pending: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.PENDING} then 1 else 0 end)`,
      rejected: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.REJECTED} then 1 else 0 end)`,
      cancelled: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.CANCELLED} then 1 else 0 end)`,
      waitlist: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.WAITLIST} then 1 else 0 end)`,
      attended: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.ATTENDED} then 1 else 0 end)`,
      absent: sql<number>`sum(case when ${registrations.status} = ${RegistrationStatus.ABSENT} then 1 else 0 end)`
    })
    .from(registrations)
    .where(sql`${registrations.activityId} = ${activityId}`);

  // 将null值转换为0
  return {
    total: Number(result.total) || 0,
    approved: Number(result.approved) || 0,
    pending: Number(result.pending) || 0,
    rejected: Number(result.rejected) || 0,
    cancelled: Number(result.cancelled) || 0,
    waitlist: Number(result.waitlist) || 0,
    attended: Number(result.attended) || 0,
    absent: Number(result.absent) || 0
  };
} 
