import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { registrations } from '@/schema/registration.schema';
import type { RegistrationStatus } from '@/schema/registration.schema';

/**
 * 更新报名状态
 * @param registrationId - 报名ID
 * @param status - 新状态
 * @returns 返回更新后的报名记录
 */
export async function updateRegistrationStatus(
  registrationId: number,
  status: RegistrationStatus
) {
  const [registration] = await db
    .update(registrations)
    .set({ status })
    .where(eq(registrations.id, registrationId))
    .returning();

  if (!registration) {
    throw new Error('报名记录不存在');
  }

  return registration;
} 
