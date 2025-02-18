'use server';

import {
  createFeedback as modelCreateFeedback,
  getFeedback as modelGetFeedback,
  getActivityFeedbacks as modelGetActivityFeedbacks,
  getUserFeedbacks as modelGetUserFeedbacks,
  updateFeedback as modelUpdateFeedback,
  deleteFeedback as modelDeleteFeedback,
  getActivityRatingStats as modelGetActivityRatingStats
} from '@/models/feedback.model';

/**
 * 创建新的反馈
 * @param feedbackData 反馈数据，包含：
 *   - userId: 用户ID
 *   - activityId: 活动ID
 *   - rating: 评分（1-5）
 *   - comment: 评价内容
 * @returns 返回创建的反馈信息
 * @throws Error 如果活动不存在或用户已经评价过
 */
export async function createFeedback(feedbackData: {
  userId: number;
  activityId: number;
  rating: number;
  comment: string;
}) {
  return modelCreateFeedback(feedbackData);
}

/**
 * 获取单个反馈的详细信息
 * @param feedbackId 反馈ID
 * @returns 返回反馈详情，包含用户和活动信息
 * @throws Error 如果反馈不存在
 */
export async function getFeedback(feedbackId: number) {
  return modelGetFeedback(feedbackId);
}

/**
 * 获取活动的所有反馈
 * @param activityId 活动ID
 * @param page 页码（默认1）
 * @param pageSize 每页数量（默认20）
 * @returns 返回反馈列表、统计信息和分页信息
 */
export async function getActivityFeedbacks(activityId: number, page = 1, pageSize = 20) {
  return modelGetActivityFeedbacks(activityId, page, pageSize);
}

/**
 * 获取用户的所有反馈
 * @param userId 用户ID
 * @param page 页码（默认1）
 * @param pageSize 每页数量（默认20）
 * @returns 返回反馈列表和分页信息
 */
export async function getUserFeedbacks(userId: number, page = 1, pageSize = 20) {
  return modelGetUserFeedbacks(userId, page, pageSize);
}

/**
 * 更新反馈内容
 * @param feedbackId 反馈ID
 * @param userId 用户ID（用于权限验证）
 * @param updateData 更新数据，可包含：
 *   - rating: 新的评分
 *   - comment: 新的评价内容
 * @returns 返回更新后的反馈信息
 * @throws Error 如果反馈不存在或用户无权限
 */
export async function updateFeedback(
  feedbackId: number,
  userId: number,
  updateData: {
    rating?: number;
    comment?: string;
  }
) {
  return modelUpdateFeedback(feedbackId, userId, updateData);
}

/**
 * 删除反馈
 * @param feedbackId 反馈ID
 * @param userId 用户ID（用于权限验证）
 * @returns 返回删除操作的结果
 * @throws Error 如果反馈不存在或用户无权限
 */
export async function deleteFeedback(feedbackId: number, userId: number) {
  return modelDeleteFeedback(feedbackId, userId);
}

/**
 * 获取活动的评分统计信息
 * @param activityId 活动ID
 * @returns 返回评分统计，包含：
 *   - totalCount: 总评价数
 *   - averageRating: 平均评分
 *   - ratingDistribution: 各分数段的统计
 */
export async function getActivityRatingStats(activityId: number) {
  return modelGetActivityRatingStats(activityId);
} 
