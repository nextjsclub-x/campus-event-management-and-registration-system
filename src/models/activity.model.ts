import db from '@/database/neon.db';
import { activities } from '@/schema/db.schema';
import { eq, and, desc, asc, sql, type SQL } from 'drizzle-orm';

// 定义活动数据的接口
interface ActivityData {
  title: string;
  description: string;
  category: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
}

// ====================
//  1. 创建活动
// ====================
export async function createActivity(organizerId: number, activityData: ActivityData) {
  // 插入新活动并返回创建的活动信息
  const [newActivity] = await db.insert(activities).values({
    organizerId,
    ...activityData,
  }).returning({
    id: activities.id,
    title: activities.title,
    description: activities.description,
    category: activities.category,
    location: activities.location,
    startTime: activities.startTime,
    endTime: activities.endTime,
    capacity: activities.capacity,
    status: activities.status,
    createdAt: activities.createdAt
  });

  return newActivity;
}

// ====================
//  2. 更新活动
// ====================
export async function updateActivity(activityId: number, activityData: Partial<ActivityData>) {
  // 1. 检查活动是否存在
  const [existingActivity] = await db.select().from(activities).where(eq(activities.id, activityId));
  if (!existingActivity) {
    throw new Error('Activity not found');
  }

  // 2. 更新活动信息
  const [updatedActivity] = await db.update(activities)
    .set({
      ...activityData,
      updatedAt: new Date(), // 更新 updatedAt 时间戳
    })
    .where(eq(activities.id, activityId))
    .returning({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      category: activities.category,
      location: activities.location,
      startTime: activities.startTime,
      endTime: activities.endTime,
      capacity: activities.capacity,
      status: activities.status,
      updatedAt: activities.updatedAt
    });

  return updatedActivity;
}

// ====================
//  3. 删除活动
// ====================
export async function deleteActivity(activityId: number) {
  // 1. 检查活动是否存在
  const [existingActivity] = await db.select().from(activities).where(eq(activities.id, activityId));
  if (!existingActivity) {
    throw new Error('Activity not found');
  }

  // 2. 软删除：将状态更新为删除状态 (假设 0 表示删除状态)
  await db.update(activities)
    .set({
      status: 0,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId));

  return { message: 'Activity deleted successfully' };
}

// 定义过滤器接口
interface ActivityFilters {
  category?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  status?: number;
  organizerId?: number;
}

// 定义分页接口
interface PaginationParams {
  page: number;
  pageSize: number;
  orderBy?: 'startTime' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

// ====================
//  4. 获取单个活动
// ====================
export async function getActivity(activityId: number) {
  const [activity] = await db.select().from(activities)
    .where(and(
      eq(activities.id, activityId),
      eq(activities.status, 1) // 只获取未删除的活动
    ));

  if (!activity) {
    throw new Error('Activity not found');
  }

  return activity;
}

// ====================
//  5. 活动列表查询
// ====================
export async function listActivities(filters: ActivityFilters, pagination: PaginationParams) {
  const { page = 1, pageSize = 10, orderBy = 'startTime', orderDirection = 'desc' } = pagination;
  const offset = (page - 1) * pageSize;

  // 构建过滤条件
  const whereConditions: SQL[] = [eq(activities.status, 1)]; // 基础条件：未删除

  if (filters.category) {
    whereConditions.push(eq(activities.category, filters.category));
  }
  
  if (filters.organizerId) {
    whereConditions.push(eq(activities.organizerId, filters.organizerId));
  }

  if (filters.status !== undefined) {
    whereConditions.push(eq(activities.status, filters.status));
  }

  if (filters.startDateFrom) {
    whereConditions.push(sql`${activities.startTime} >= ${filters.startDateFrom}`);
  }

  if (filters.startDateTo) {
    whereConditions.push(sql`${activities.startTime} <= ${filters.startDateTo}`);
  }

  // 构建排序条件
  const orderColumn = orderBy === 'startTime' ? activities.startTime : activities.createdAt;
  const orderFunc = orderDirection === 'desc' ? desc : asc;

  // 执行查询
  const [activitiesData, [{ count }]] = await Promise.all([
    db.select()
      .from(activities)
      .where(and(...whereConditions))
      .orderBy(orderFunc(orderColumn))
      .limit(pageSize)
      .offset(offset),
    db.select({ 
      count: sql<number>`cast(count(*) as integer)` 
    })
      .from(activities)
      .where(and(...whereConditions))
  ]);

  return {
    data: activitiesData,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    }
  };
}

// ====================
//  6. 活动状态查询
// ====================
export async function getActivityStatus(activityId: number) {
  const [activity] = await db.select({
    id: activities.id,
    status: activities.status,
    startTime: activities.startTime,
    endTime: activities.endTime,
    capacity: activities.capacity
  })
  .from(activities)
  .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 可以根据需求添加更多状态逻辑
  const now = new Date();
  let statusText: string;

  if (activity.status === 0) {
    statusText = 'deleted';
  } else if (now < activity.startTime) {
    statusText = 'upcoming';
  } else if (now >= activity.startTime && now <= activity.endTime) {
    statusText = 'ongoing';
  } else {
    statusText = 'completed';
  }

  return {
    id: activity.id,
    status: activity.status,
    statusText,
    startTime: activity.startTime,
    endTime: activity.endTime,
    capacity: activity.capacity
  };
}

// 活动状态常量
export const ActivityStatus = {
  DELETED: 0,
  DRAFT: 1,      // 草稿
  PUBLISHED: 2,  // 已发布
  CANCELLED: 3,  // 已取消
  FULL: 4,       // 已满员
  CLOSED: 5      // 已关闭
} as const;

// 定义状态类型
type ActivityStatusType = typeof ActivityStatus[keyof typeof ActivityStatus];

// ====================
//  7. 发布活动
// ====================
export async function publishActivity(activityId: number) {
  // 1. 检查活动是否存在且状态为草稿
  const [activity] = await db.select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.status, ActivityStatus.DRAFT)
      )
    );

  if (!activity) {
    throw new Error('Activity not found or not in draft status');
  }

  // 2. 检查活动时间是否有效
  const now = new Date();
  if (activity.startTime <= now) {
    throw new Error('Cannot publish activity with past start time');
  }

  // 3. 更新状态为已发布
  const [updatedActivity] = await db.update(activities)
    .set({
      status: ActivityStatus.PUBLISHED,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning({
      id: activities.id,
      status: activities.status,
      title: activities.title,
      startTime: activities.startTime,
      updatedAt: activities.updatedAt
    });

  return updatedActivity;
}

// ====================
//  8. 取消发布活动
// ====================
export async function unpublishActivity(activityId: number) {
  // 1. 检查活动是否存在且状态为已发布
  const [activity] = await db.select()
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.status, ActivityStatus.PUBLISHED)
      )
    );

  if (!activity) {
    throw new Error('Activity not found or not in published status');
  }

  // 2. 检查活动是否已开始
  const now = new Date();
  if (activity.startTime <= now) {
    throw new Error('Cannot unpublish an ongoing or completed activity');
  }

  // 3. 更新状态为草稿
  const [updatedActivity] = await db.update(activities)
    .set({
      status: ActivityStatus.DRAFT,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning({
      id: activities.id,
      status: activities.status,
      title: activities.title,
      updatedAt: activities.updatedAt
    });

  return updatedActivity;
}

// ====================
//  9. 更新活动状态
// ====================
export async function updateActivityStatus(activityId: number, newStatus: ActivityStatusType) {
  // 1. 检查活动是否存在
  const [activity] = await db.select()
    .from(activities)
    .where(eq(activities.id, activityId));

  if (!activity) {
    throw new Error('Activity not found');
  }

  // 2. 状态转换验证
  const validTransitions = new Map<ActivityStatusType, ActivityStatusType[]>([
    [ActivityStatus.DRAFT, [ActivityStatus.PUBLISHED, ActivityStatus.DELETED]],
    [ActivityStatus.PUBLISHED, [ActivityStatus.CANCELLED, ActivityStatus.FULL, ActivityStatus.CLOSED]],
    [ActivityStatus.FULL, [ActivityStatus.PUBLISHED, ActivityStatus.CANCELLED, ActivityStatus.CLOSED]],
    // 终态：DELETED, CANCELLED, CLOSED 状态不能再改变
  ]);

  const allowedNextStates = validTransitions.get(activity.status as ActivityStatusType);
  if (!allowedNextStates?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${activity.status} to ${newStatus}`);
  }

  // 3. 更新状态
  const [updatedActivity] = await db.update(activities)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning({
      id: activities.id,
      status: activities.status,
      title: activities.title,
      updatedAt: activities.updatedAt
    });

  return updatedActivity;
}
