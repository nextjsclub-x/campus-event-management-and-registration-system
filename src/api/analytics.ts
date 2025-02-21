import { get } from '@/utils/request';
import type { DashboardStatistics } from '@/models/analytics/get-dashboard-statistics';

/**
 * 获取仪表盘统计数据
 */
export const getDashboardStats = () => 
  get<DashboardStatistics>('/api/analytics/dashboard');

/**
 * 使用示例：
 * ```typescript
 * // 获取仪表盘统计数据
 * const response = await getDashboardStats();
 * 
 * if (response.code === 200) {
 *   const {
 *     registrationStats,
 *     categoryDistribution,
 *     activityRatings,
 *     topParticipants,
 *     recentActivityStats
 *   } = response.data;
 *   
 *   console.log('报名状态统计:', registrationStats);
 *   console.log('活动类别分布:', categoryDistribution);
 *   console.log('活动评分分布:', activityRatings);
 *   console.log('最活跃参与者:', topParticipants);
 *   console.log('最近活动统计:', recentActivityStats);
 * }
 * ```
 */ 
