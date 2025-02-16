/**
 * 报名服务
 * 处理活动报名相关的业务逻辑
 */
import {
  RegistrationStatus,
  getUserRegistrations,
  getActivityRegistrations,
  updateRegistrationStatus as modelUpdateRegistrationStatus,
  registerActivity,
  getRegistrationStatus
} from '@/models/registration.model';

import { createNotification } from '@/models/notification.model';
import { getActivity, ActivityStatus } from '@/models/activity.model';

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
