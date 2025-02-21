import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import { users } from '@/schema/user.schema';
import { activities } from '@/schema/activity.schema';

export async function getFeedback(feedbackId: number) {
  const [result] = await db.select({
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
    userId: feedback.userId,
    activityId: feedback.activityId,
    // 关联用户信息
    userName: users.name,
    // 关联活动信息
    activityTitle: activities.title,
  })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .leftJoin(activities, eq(feedback.activityId, activities.id))
    .where(eq(feedback.id, feedbackId));

  if (!result) {
    throw new Error('Feedback not found');
  }

  return result;
} 
