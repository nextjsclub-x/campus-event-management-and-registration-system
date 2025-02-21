import { eq, and } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import type { RegistrationStatus } from '@/schema/registration.schema';

/**
 * 获取用户对特定活动的报名状态
 * @param userId - 用户ID
 * @param activityId - 活动ID
 * @returns 返回报名状态，如果未报名则返回null
 */
export async function getRegistrationStatus(userId: number, activityId: number): Promise<RegistrationStatus | null> {
  const [registration] = await db
    .select({
      status: registrations.status
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.activityId, activityId)
      )
    );

  return registration?.status ?? null;
} 
