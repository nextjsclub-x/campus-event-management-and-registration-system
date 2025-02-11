'use server'

import {
  getCategories,
  createCategory,
  updateCategory,
  getActivitiesByCategory,
  setActivityCategory,
  getCategoryStats
} from '@/models/category.model';

/**
 * 获取分类列表
 * @returns 返回所有分类信息
 */
export async function getCategoryList() {
  try {
    return await getCategories();
  } catch (error: any) {
    throw new Error(`获取分类列表失败：${error.message}`);
  }
}

/**
 * 创建新分类
 * @param data 分类数据，包含：
 *   - name: 分类名称
 *   - description?: 分类描述
 * @returns 返回创建的分类信息
 */
export async function createCategoryService(data: {
  name: string;
  description?: string;
}) {
  if (!data.name) {
    throw new Error('创建分类失败：缺少分类名称');
  }

  try {
    return await createCategory(data);
  } catch (error: any) {
    throw new Error(`创建分类失败：${error.message}`);
  }
}

/**
 * 更新分类信息
 * @param categoryId 分类ID
 * @param data 更新数据，可包含：
 *   - name?: 分类名称
 *   - description?: 分类描述
 * @returns 返回更新结果
 */
export async function updateCategoryService(
  categoryId: number,
  data: {
    name?: string;
    description?: string;
  }
) {
  if (!categoryId) {
    throw new Error('更新分类失败：缺少分类ID');
  }

  try {
    return await updateCategory(categoryId, data);
  } catch (error: any) {
    throw new Error(`更新分类失败：${error.message}`);
  }
}

/**
 * 获取分类下的活动列表
 * @param categoryId 分类ID
 * @param filters 过滤条件
 * @param pagination 分页参数
 * @returns 返回活动列表和总数
 */
export async function getCategoryActivities(
  categoryId: number,
  filters: {
    status?: number;
    startTime?: Date;
    endTime?: Date;
  } = {},
  pagination: {
    page?: number;
    pageSize?: number;
  } = {}
) {
  if (!categoryId) {
    throw new Error('获取分类活动失败：缺少分类ID');
  }

  try {
    return await getActivitiesByCategory(categoryId, filters, pagination);
  } catch (error: any) {
    throw new Error(`获取分类活动失败：${error.message}`);
  }
}

/**
 * 设置活动分类
 * @param activityId 活动ID
 * @param categoryId 分类ID
 * @returns 返回更新结果
 */
export async function setActivityCategoryService(
  activityId: number,
  categoryId: number
) {
  if (!activityId || !categoryId) {
    throw new Error('设置活动分类失败：缺少必要参数');
  }

  try {
    return await setActivityCategory(activityId, categoryId);
  } catch (error: any) {
    throw new Error(`设置活动分类失败：${error.message}`);
  }
}

/**
 * 获取分类统计数据
 * @param categoryId 分类ID
 * @returns 返回分类统计信息
 */
export async function getCategoryStatistics(categoryId: number) {
  if (!categoryId) {
    throw new Error('获取分类统计失败：缺少分类ID');
  }

  try {
    return await getCategoryStats(categoryId);
  } catch (error: any) {
    throw new Error(`获取分类统计失败：${error.message}`);
  }
}

/**
 * 获取单个分类详情
 * @param categoryId 分类ID
 * @returns 返回分类详情
 */
export async function getCategoryById(categoryId: number) {
  if (!categoryId) {
    throw new Error('获取分类详情失败：缺少分类ID');
  }

  try {
    const categories = await getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      throw new Error('分类不存在');
    }

    return category;
  } catch (error: any) {
    throw new Error(`获取分类详情失败：${error.message}`);
  }
} 
