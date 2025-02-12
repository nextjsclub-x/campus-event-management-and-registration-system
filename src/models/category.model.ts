import db from '@/database/neon.db';
import { and, eq, sql } from 'drizzle-orm';
import { categories } from '@/schema/category.schema';
import { activities } from '@/schema/activity.schema';

// ====================
//  1. 获取分类列表
// ====================
export async function getCategories() {
  const results = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt
    })
    .from(categories);

  return results;
}

// ====================
//  2. 创建分类
// ====================
interface CategoryData {
  name: string;
  description?: string;
}

interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export async function createCategory(categoryData: CategoryData) {
  // 1. 检查分类名是否已存在
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, categoryData.name));

  if (existingCategory) {
    throw new Error('Category name already exists');
  }

  // 2. 创建新分类
  const [newCategory] = await db
    .insert(categories)
    .values({
      name: categoryData.name,
      description: categoryData.description
    })
    .returning({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      createdAt: categories.createdAt
    });

  return newCategory;
}

// ====================
//  3. 更新分类
// ====================
export async function updateCategory(categoryId: number, categoryData: UpdateCategoryData) {
  // 1. 检查分类是否存在
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // 2. 如果要更新名称，检查新名称是否与其他分类重复
  if (categoryData.name && categoryData.name !== existingCategory.name) {
    const [duplicateCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryData.name));

    if (duplicateCategory) {
      throw new Error('Category name already exists');
    }
  }

  // 3. 更新分类
  await db
    .update(categories)
    .set({
      name: categoryData.name,
      description: categoryData.description,
      updatedAt: new Date()
    })
    .where(eq(categories.id, categoryId));

  return { message: 'Category updated successfully' };
}

// ====================
//  4. 获取分类下的活动
// ====================
interface ActivityFilter {
  status?: number;
  startTime?: Date;
  endTime?: Date;
}

interface Pagination {
  page?: number;
  pageSize?: number;
}

export async function getActivitiesByCategory(
  categoryId: number,
  filters: ActivityFilter = {},
  pagination: Pagination = {}
) {
  const { status, startTime, endTime } = filters;
  const { page = 1, pageSize = 10 } = pagination;
  const offset = (page - 1) * pageSize;

  // 1. 检查分类是否存在
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!category) {
    throw new Error('Category not found');
  }

  // 2. 收集查询条件
  const conditions = [eq(activities.categoryId, categoryId)];
  if (typeof status !== 'undefined') {
    conditions.push(eq(activities.status, status));
  }
  if (startTime) {
    conditions.push(sql`${activities.startTime} >= ${startTime}`);
  }
  if (endTime) {
    conditions.push(sql`${activities.endTime} <= ${endTime}`);
  }

  // 3. 查询总数
  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(activities)
    .where(and(...conditions));

  // 4. 查询分页数据
  const results = await db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      startTime: activities.startTime,
      endTime: activities.endTime,
      location: activities.location,
      capacity: activities.capacity,
      status: activities.status,
      createdAt: activities.createdAt
    })
    .from(activities)
    .where(and(...conditions))
    .limit(pageSize)
    .offset(offset);

  return {
    activities: results,
    total: count
  };
}

// ====================
//  5. 设置活动分类
// ====================
export async function setActivityCategory(activityId: number, categoryId: number) {
  // 1. 检查活动是否存在
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 检查分类是否存在
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!category) {
    throw new Error('Category not found');
  }

  // 3. 更新活动分类
  await db
    .update(activities)
    .set({ categoryId })
    .where(eq(activities.id, activityId));

  return { message: 'Activity category updated successfully' };
}

// ====================
//  6. 获取分类统计数据
// ====================
export async function getCategoryStats(categoryId: number) {
  // 1. 检查分类是否存在
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));

  if (!category) {
    throw new Error('Category not found');
  }

  // 2. 获取活动总数
  const [{ totalActivities }] = await db
    .select({
      totalActivities: sql`count(*)`.mapWith(Number)
    })
    .from(activities)
    .where(eq(activities.categoryId, categoryId));

  // 3. 获取各状态活动数量
  const statusStats = await db
    .select({
      status: activities.status,
      count: sql`count(*)`.mapWith(Number)
    })
    .from(activities)
    .where(eq(activities.categoryId, categoryId))
    .groupBy(activities.status);

  // 4. 获取最近活动
  const recentActivities = await db
    .select({
      id: activities.id,
      title: activities.title,
      startTime: activities.startTime,
      status: activities.status
    })
    .from(activities)
    .where(eq(activities.categoryId, categoryId))
    .orderBy(activities.createdAt)
    .limit(5);

  return {
    totalActivities,
    statusStats,
    recentActivities
  };
}
