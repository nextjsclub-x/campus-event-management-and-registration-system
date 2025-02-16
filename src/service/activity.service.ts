import {
  ActivityStatus,
  type ActivityStatusType,
  createActivity as modelCreateActivity,
  updateActivity as modelUpdateActivity,
  deleteActivity as modelDeleteActivity,
  getActivity as modelGetActivity,
  listActivities as modelListActivities,
  updateActivityStatus as modelUpdateActivityStatus,
  publishActivity as modelPublishActivity,
  unpublishActivity as modelUnpublishActivity,
  getActivitiesByOrganizer as modelGetActivitiesByOrganizer
} from '@/models/activity.model';

import { activities } from '@/schema/activity.schema';
import { createNotification } from '@/models/notification.model';
import { getActivityRegistrationCount } from './registration.service';

// 导出活动状态常量
export { ActivityStatus, type ActivityStatusType };

// 使用drizzle的类型推导
type Activity = typeof activities.$inferSelect;

// 服务层方法实现

/**
 * 创建新活动
 * @param organizerId 组织者ID
 * @param activityData 活动数据，包含：
 *   - title: 活动标题
 *   - description: 活动描述
 *   - startTime: 开始时间
 *   - endTime: 结束时间
 *   - location: 活动地点
 *   - capacity: 活动容量
 *   - categoryId: 活动类别ID
 * @returns 返回创建的活动信息
 */
export async function createActivity(organizerId: number, activityData: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  categoryId: number;
}) {
  return modelCreateActivity(organizerId, activityData);
}

/**
 * 更新活动信息
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @param activityData 需要更新的活动数据，可包含：
 *   - title: 活动标题
 *   - description: 活动描述
 *   - startTime: 开始时间
 *   - endTime: 结束时间
 *   - location: 活动地点
 *   - capacity: 活动容量
 *   - categoryId: 活动类别ID
 * @returns 返回更新后的活动信息
 */
export async function updateActivity(
  activityId: number,
  organizerId: number,
  activityData: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
    capacity?: number;
    categoryId?: number;
  }
) {
  return modelUpdateActivity(activityId, organizerId, activityData);
}

/**
 * 删除活动
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @returns 返回删除操作的结果
 */
export async function deleteActivity(activityId: number, organizerId: number) {
  return modelDeleteActivity(activityId, organizerId);
}

/**
 * 获取单个活动的详细信息
 * @param activityId 活动ID
 * @returns 返回活动的详细信息
 */
export async function getActivity(activityId: number) {
  return modelGetActivity(activityId);
}

/**
 * 列出活动
 * @param filters 过滤条件，可包含：
 *   - status: 活动状态
 *   - categoryId: 活动类别ID
 *   - startTime: 开始时间
 *   - endTime: 结束时间
 *   - page: 页码
 *   - pageSize: 每页数量
 *   - orderBy: 排序字段（'startTime' 或 'createdAt'）
 *   - order: 排序方式（'asc' 或 'desc'）
 * @returns 返回活动列表和分页信息
 */
export async function listActivities(filters: {
  status?: ActivityStatusType;
  categoryId?: number;
  startTime?: Date;
  endTime?: Date;
  page?: number;
  pageSize?: number;
  orderBy?: 'startTime' | 'createdAt';
  order?: 'asc' | 'desc';
}) {
  const result = await modelListActivities(filters);

  // 获取每个活动的报名人数
  const activitiesWithRegistrations = await Promise.all(
    result.activities.map(async (activity: typeof result.activities[number]) => ({
      ...activity,
      currentRegistrations: await getActivityRegistrationCount(activity.id)
    }))
  );

  return {
    activities: activitiesWithRegistrations,
    pagination: result.pagination
  };
}

/**
 * 更新活动状态
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @param newStatus 新的活动状态
 * @returns 返回更新后的活动状态信息
 */
export async function updateActivityStatus(
  activityId: number,
  organizerId: number,
  newStatus: ActivityStatusType
) {
  return modelUpdateActivityStatus(activityId, organizerId, newStatus);
}

/**
 * 发布活动
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @returns 返回发布后的活动信息
 */
export async function publishActivity(activityId: number, organizerId: number) {
  return modelPublishActivity(activityId, organizerId);
}

/**
 * 取消发布活动
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @returns 返回取消发布后的活动信息
 */
export async function unpublishActivity(activityId: number, organizerId: number) {
  return modelUnpublishActivity(activityId, organizerId);
}

/**
 * 获取组织者的所有活动
 * @param organizerId 组织者ID
 * @returns 返回该组织者的所有活动列表
 */
export async function getActivitiesByOrganizer(organizerId: number) {
  return modelGetActivitiesByOrganizer(organizerId);
}

/**
 * 检查活动容量信息
 * @param activityId 活动ID
 * @returns 返回活动容量信息
 */
export async function checkActivityCapacity(activityId: number) {
  const activity = await modelGetActivity(activityId);
  if (!activity) {
    throw new Error('活动不存在');
  }
  
  // 获取已注册人数
  const registeredCount = await getActivityRegistrationCount(activityId);
  
  return {
    capacity: activity.capacity,
    registered: registeredCount,
    available: activity.capacity - registeredCount
  };
}

/**
 * 更新活动容量
 * @param activityId 活动ID
 * @param organizerId 组织者ID
 * @param newCapacity 新的容量
 * @returns 返回更新后的活动信息
 */
export async function updateActivityCapacity(
  activityId: number,
  organizerId: number,
  newCapacity: number
) {
  if (newCapacity < 0) {
    throw new Error('活动容量不能小于0');
  }
  
  return modelUpdateActivity(activityId, organizerId, {
    capacity: newCapacity
  });
}

/**
 * 审核活动
 * @param activityId 活动ID
 * @param approved 是否通过
 * @param reviewerId 审核者ID
 * @param reason 审核原因
 * @returns 返回更新后的活动信息
 */
export async function reviewActivity(
  activityId: number,
  approved: boolean,
  reviewerId: number,
  reason?: string
) {
  const activity = await getActivity(activityId);
  
  if (!activity) {
    throw new Error('活动不存在');
  }

  // 更新活动状态
  const newStatus = approved ? ActivityStatus.PUBLISHED : ActivityStatus.DRAFT;
  const updatedActivity = await modelUpdateActivityStatus(activityId, reviewerId, newStatus);
  
  // 发送通知给活动组织者
  await createNotification(
    activity.organizerId,
    activityId,
    `您的活动「${activity.title}」${approved ? '已通过审核' : '审核未通过'}${reason ? `，原因：${reason}` : ''}`
  );
  
  return updatedActivity;
}

/**
 * 检查活动时间冲突
 * @param organizerId 组织者ID
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param excludeActivityId 需要排除的活动ID（用于编辑时）
 * @returns 返回冲突的活动列表
 */
export async function checkActivityTimeConflict(
  organizerId: number,
  startTime: Date,
  endTime: Date,
  excludeActivityId?: number
) {
  // 获取该组织者的所有活动
  const activities = await modelGetActivitiesByOrganizer(organizerId);

  // 过滤出已发布的活动，并检查时间冲突
  const conflicts = activities.filter(activity => {
    if (
      activity.status !== ActivityStatus.PUBLISHED ||
      (excludeActivityId && activity.id === excludeActivityId)
    ) {
      return false;
    }

    const activityStart = new Date(activity.startTime);
    const activityEnd = new Date(activity.endTime);

    // 检查是否有时间重叠
    return (
      (startTime >= activityStart && startTime < activityEnd) ||
      (endTime > activityStart && endTime <= activityEnd) ||
      (startTime <= activityStart && endTime >= activityEnd)
    );
  });

  return conflicts;
}

/**
 * 获取活动列表
 * @param options 查询选项
 */
export async function getActivities(options: GetActivitiesOptions = {}) {
  const { activities, pagination } = await modelGetActivities(options);

  // 获取每个活动的报名人数
  const activitiesWithRegistrations = await Promise.all(
    activities.map(async (activity) => ({
      ...activity,
      currentRegistrations: await getActivityRegistrationCount(activity.id)
    }))
  );

  return {
    activities: activitiesWithRegistrations,
    pagination
  };
}
