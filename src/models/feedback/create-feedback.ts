import { and, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import { activities } from '@/schema/activity.schema';

export async function createFeedback(feedbackData: {
  userId: number;
  activityId: number;
  rating: number;
  comment: string;
}) {
  // 1. 验证活动是否存在
  const [activity] = await db.select()
    .from(activities)
    .where(eq(activities.id, feedbackData.activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 检查用户是否已经评价过
  const [existingFeedback] = await db.select()
    .from(feedback)
    .where(
      and(
        eq(feedback.userId, feedbackData.userId),
        eq(feedback.activityId, feedbackData.activityId)
      )
    );

  if (existingFeedback) {
    throw new Error('You have already provided feedback for this activity');
  }

  // 3. 创建反馈
  const [newFeedback] = await db.insert(feedback)
    .values({
      ...feedbackData,
      createdAt: new Date(),
    })
    .returning();

  return newFeedback;
} 
