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

// 导出活动状态常量
export { ActivityStatus, type ActivityStatusType };

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
  return modelListActivities(filters);
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
