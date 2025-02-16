/**
 * 报名服务
 * 处理活动报名相关的业务逻辑
 */
import {
  getUserRegistrations,
  getActivityRegistrations,
  updateRegistrationStatus as modelUpdateRegistrationStatus,
  registerActivity,
  // getRegistrationStatus
} from '@/models/registration.model';

import { createNotification } from '@/models/notification.model';
import { getActivity, ActivityStatus } from '@/models/activity.model';
import { RegistrationStatus } from '@/schema/registration.schema';

// 导出报名状态常量
export { RegistrationStatus };

// 创建报名
export async function createRegistration(userId: number, activityId: number) {
  const activity = await getActivity(activityId);
  
  // 检查活动状态
  if (activity.status !== ActivityStatus.PUBLISHED) {
    throw new Error('活动不在报名阶段');
  }

  // 检查容量
  if (activity.currentRegistrations >= activity.capacity) {
    throw new Error('活动已满员');
  }
  
  const registration = await registerActivity(userId, activityId);
  
  // 发送通知给活动组织者
  await createNotification(
    activity.organizerId,
    activityId,
    `有新的报名申请：${registration.id}`
  );
  
  return registration;
}

// 更新报名状态
export async function updateRegistrationStatus(
  registrationId: number,
  operatorId: number,
  newStatus: number
) {
  // 获取报名列表来获取完整的报名信息
  const { registrations } = await getActivityRegistrations(registrationId, {
    page: 1,
    pageSize: 1
  });
  
  if (!registrations.length) {
    throw new Error('报名记录不存在');
  }
  
  const registration = registrations[0];
  const activity = await getActivity(registration.activityId);
  
  // 检查操作权限
  if (activity.organizerId !== operatorId) {
    throw new Error('无权限操作');
  }
  
  const updatedRegistration = await modelUpdateRegistrationStatus(
    registrationId,
    newStatus,
    operatorId
  );
  
  // 发送通知给报名者
  await createNotification(
    registration.userId,
    activity.id,
    `您的报名状态已更新为：${Object.keys(RegistrationStatus).find(
      key => RegistrationStatus[key as keyof typeof RegistrationStatus] === newStatus
    )}`
  );
  
  return updatedRegistration;
}

// 获取报名列表
export async function getRegistrations(
  activityId: number,
  status?: typeof RegistrationStatus[keyof typeof RegistrationStatus]
) {
  const result = await getActivityRegistrations(activityId, {
    status,
    page: 1,
    pageSize: 100
  });
  
  return {
    registrations: result.registrations,
    total: result.pagination.total
  };
}

// 获取单个报名信息
export async function getRegistration(registrationId: number) {
  const { registrations } = await getActivityRegistrations(registrationId, {
    page: 1,
    pageSize: 1
  });

  if (!registrations.length) {
    throw new Error('报名记录不存在');
  }

  return registrations[0];
}

/**
 * 取消报名
 * @param registrationId 报名ID
 * @param userId 用户ID（用于验证权限）
 */
export async function cancelRegistration(registrationId: number, userId: number) {
  const registration = await getRegistration(registrationId);
  
  if (!registration) {
    throw new Error('报名记录不存在');
  }

  // 验证是否是用户本人操作
  if (registration.userId !== userId) {
    throw new Error('无权限操作');
  }

  // 获取活动信息
  const activity = await getActivity(registration.activityId);
  
  // 检查活动是否已开始
  if (new Date(activity.startTime) <= new Date()) {
    throw new Error('活动已开始，无法取消报名');
  }

  // 更新报名状态为已取消
  const updatedRegistration = await modelUpdateRegistrationStatus(
    registrationId,
    RegistrationStatus.CANCELLED,
    userId
  );

  // 发送通知给活动组织者
  await createNotification(
    activity.organizerId,
    activity.id,
    `用户已取消报名：${registration.id}`
  );

  return updatedRegistration;
}

/**
 * 检查用户是否已报名活动
 * @param userId 用户ID
 * @param activityId 活动ID
 * @returns 返回报名信息，如果未报名返回null
 */
export async function checkUserRegistration(userId: number, activityId: number) {
  const { registrations } = await getUserRegistrations(userId, {
    page: 1,
    pageSize: 1,
    status: RegistrationStatus.CONFIRMED // 只检查已确认的报名
  });

  // 从结果中筛选指定活动的报名
  const registration = registrations.find(reg => reg.activityId === activityId);
  return registration || null;
}

/**
 * 获取活动的报名人数
 * @param activityId 活动ID
 * @returns 返回有效报名人数（已确认的）
 */
export async function getActivityRegistrationCount(activityId: number) {
  const { registrations } = await getActivityRegistrations(activityId, {
    status: RegistrationStatus.CONFIRMED // 只计算已确认的报名
  });

  return registrations.length;
} 
