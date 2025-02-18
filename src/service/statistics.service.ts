'use server';

import {
  getActivityStatusCount,
  getRecentActivityCount,
  getPopularActivities,
} from '@/models/activity.model';

import {
  getRegistrationStatusCount,
  getRecentRegistrationCount,
  getRegistrationStats,
} from '@/models/registration.model';

import {
  getCategoryActivityCount,
  getCategoryRegistrationCount,
} from '@/models/category.model';

import type { 
  ActivityStatistics,
  RegistrationStatistics,
  CategoryStatistics,
  OverviewStatistics
} from '@/types/statistics.types';

/**
 * 获取活动统计信息
 */
export async function getActivityStatistics(): Promise<ActivityStatistics> {
  // 获取各状态活动数量
  const statusCount = await getActivityStatusCount();

  // 获取最近一周活动数量
  const recentActivities = await getRecentActivityCount();

  // 获取热门活动 Top 5
  const popularActivities = await getPopularActivities(5);

  return {
    statusCount,
    recentActivities,
    popularActivities,
  };
}

/**
 * 获取报名统计信息
 */
export async function getRegistrationStatistics(): Promise<RegistrationStatistics> {
  // 获取总报名人次和各状态报名数量
  const { totalRegistrations, statusCount } = await getRegistrationStats();

  // 获取最近一周报名趋势
  const recentRegistrations = await getRecentRegistrationCount();

  return {
    totalCount: totalRegistrations,
    statusCount,
    recentRegistrations,
  };
}

/**
 * 获取分类统计信息
 */
export async function getCategoryStatistics(): Promise<CategoryStatistics> {
  // 获取各分类下的活动数量
  const categoryActivityCount = await getCategoryActivityCount();

  // 获取各分类下的报名人数
  const categoryRegistrationCount = await getCategoryRegistrationCount();

  return {
    categoryActivityCount,
    categoryRegistrationCount,
  };
}

/**
 * 获取概览统计数据
 */
export async function getOverviewStatistics(): Promise<OverviewStatistics> {
  // 获取活动和报名的统计数据
  const { 
    totalRegistrations,
    newRegistrationsThisMonth,
    totalActivities,
    newActivitiesThisMonth 
  } = await getRegistrationStats();

  return {
    totalActivities,
    newActivitiesThisMonth,
    totalRegistrations,
    newRegistrationsThisMonth,
  };
} 
