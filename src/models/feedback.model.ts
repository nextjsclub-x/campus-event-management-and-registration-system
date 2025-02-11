import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import { activities } from '@/schema/activity.schema';
import { users } from '@/schema/user.schema';
import { eq, and, desc, sql } from 'drizzle-orm';

type Feedback = typeof feedback.$inferSelect;
type NewFeedback = typeof feedback.$inferInsert;

// ====================
//  1. 创建反馈
// ====================
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

// ====================
//  2. 获取单个反馈
// ====================
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

// ====================
//  3. 获取活动的所有反馈
// ====================
export async function getActivityFeedbacks(activityId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  // 1. 获取反馈列表
  const feedbacks = await db.select({
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
    userId: feedback.userId,
    userName: users.name,
  })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(eq(feedback.activityId, activityId))
    .orderBy(desc(feedback.createdAt))
    .limit(pageSize)
    .offset(offset);

  // 2. 获取总数
  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`,
  })
    .from(feedback)
    .where(eq(feedback.activityId, activityId));

  // 3. 计算平均评分
  const [{ avgRating }] = await db.select({
    avgRating: sql<number>`round(avg(${feedback.rating})::numeric, 1)`,
  })
    .from(feedback)
    .where(eq(feedback.activityId, activityId));

  return {
    feedbacks,
    stats: {
      totalCount: count,
      averageRating: avgRating || 0,
    },
    pagination: {
      current: page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

// ====================
//  4. 获取用户的所有反馈
// ====================
export async function getUserFeedbacks(userId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const feedbacks = await db.select({
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
    activityId: feedback.activityId,
    activityTitle: activities.title,
  })
    .from(feedback)
    .leftJoin(activities, eq(feedback.activityId, activities.id))
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db.select({
    count: sql<number>`cast(count(*) as integer)`,
  })
    .from(feedback)
    .where(eq(feedback.userId, userId));

  return {
    feedbacks,
    pagination: {
      current: page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

// ====================
//  5. 更新反馈
// ====================
export async function updateFeedback(
  feedbackId: number,
  userId: number,
  updateData: {
    rating?: number;
    comment?: string;
  }
) {
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
    throw new Error('Feedback not found or you do not have permission to update it');
  }

  // 2. 更新反馈
  const [updatedFeedback] = await db.update(feedback)
    .set(updateData)
    .where(eq(feedback.id, feedbackId))
    .returning();

  return updatedFeedback;
}

// ====================
//  6. 删除反馈
// ====================
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

// ====================
//  7. 获取活动评分统计
// ====================
export async function getActivityRatingStats(activityId: number) {
  const [stats] = await db.select({
    totalCount: sql<number>`cast(count(*) as integer)`,
    averageRating: sql<number>`round(avg(${feedback.rating})::numeric, 1)`,
    // 各分数段的统计
    rating5Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 5) as integer)`,
    rating4Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 4) as integer)`,
    rating3Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 3) as integer)`,
    rating2Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 2) as integer)`,
    rating1Count: sql<number>`cast(count(*) filter (where ${feedback.rating} = 1) as integer)`,
  })
    .from(feedback)
    .where(eq(feedback.activityId, activityId));

  return {
    ...stats,
    ratingDistribution: {
      5: stats.rating5Count,
      4: stats.rating4Count,
      3: stats.rating3Count,
      2: stats.rating2Count,
      1: stats.rating1Count,
    },
  };
} 
