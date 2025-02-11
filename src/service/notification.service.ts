'use server'

import {
  createNotification as createNotificationModel,
  getUserNotifications as getUserNotificationsModel,
  markNotificationAsRead as markNotificationAsReadModel,
  getNotificationById as getNotificationByIdModel,
} from '@/models/notification.model';

// 从 activity service 引入获取活动的方法
import { getActivity } from '@/service/activity.service';

// 定义通知过滤器接口
export interface ListNotificationsFilter {
  isRead?: boolean;
}

// 创建通知
export async function createNotification(
  userId: number, 
  activityId: number | null, 
  message: string
) {
  if (!userId || !message) {
    throw new Error(`创建通知失败：缺少必要参数 [${  
      [
        !userId && '用户ID',
        !message && '公告内容'
      ].filter(Boolean).join(', ')  
    }]`);
  }

  try {
    return await createNotificationModel(userId, activityId, message);
  } catch (error: any) {
    throw new Error(`创建通知失败：${error.message}`);
  }
}

// 获取用户通知列表
export async function getUserNotifications(
  userId: number,
  filters: ListNotificationsFilter = {},
  pagination = { page: 1, pageSize: 10 }
) {
  if (!userId) {
    throw new Error('获取通知列表失败：缺少用户ID');
  }

  try {
    const result = await getUserNotificationsModel(userId, filters, pagination);
    
    // 获取所有相关活动的信息
    const notifications = await Promise.all(
      result.notifications.map(async (notification) => {
        if (notification.activityId) {
          try {
            const activity = await getActivity(notification.activityId);
            return {
              ...notification,
              activity: {
                id: activity.id,
                title: activity.title
              }
            };
          } catch (error) {
            // 如果获取活动失败，保持原样返回
            return notification;
          }
        }
        return notification;
      })
    );

    return {
      ...result,
      notifications
    };
  } catch (error: any) {
    throw new Error(`获取通知列表失败：${error.message}`);
  }
}

// 标记通知已读
export async function markNotificationAsRead(notificationId: number) {
  if (!notificationId) {
    throw new Error('标记通知已读失败：缺少通知ID');
  }

  try {
    return await markNotificationAsReadModel(notificationId);
  } catch (error: any) {
    throw new Error(`标记通知已读失败：${error.message}`);
  }
}

// 获取通知详情
export async function getNotificationById(notificationId: number) {
  if (!notificationId) {
    throw new Error('获取通知详情失败：缺少通知ID');
  }

  try {
    return await getNotificationByIdModel(notificationId);
  } catch (error: any) {
    throw new Error(`获取通知详情失败：${error.message}`);
  }
}
