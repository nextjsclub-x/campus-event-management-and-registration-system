import { and, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';

export async function deleteFeedback(feedbackId: number, userId: number) {
  // 1. 检查反馈是否存在且属于该用户
  const [existingFeedback] = await db.select()
    .from(feedback)
    .where(
      and(
        eq(feedback.id, feedbackId),
        eq(feedback.userId, userId)
      )
    );

  if (!existingFeedback) {
    throw new Error('Feedback not found or you do not have permission to delete it');
  }

  // 2. 删除反馈
  await db.delete(feedback)
    .where(eq(feedback.id, feedbackId));

  return { success: true };
} 
