import type { SQL } from 'drizzle-orm';
import { registrations, RegistrationStatus } from '@/schema/registration.schema';

// 导出活动状态枚举
export enum ActivityStatus {
  DRAFT = 0,      // 草稿
  PUBLISHED = 1,  // 已发布
  CANCELLED = 2,  // 已取消
  DELETED = 3,    // 已删除
}

// 导出报名状态枚举
export { RegistrationStatus };

// 定义报名状态类型
export type RegistrationStatusType = RegistrationStatus;

// 定义返回类型接口
export interface RegistrationInfo {
  id: number;
  userId: number;
  activityId: number;
  status: number;
  registeredAt: Date;
  userName: string;    // 从 users 表关联
  activityTitle?: string; // 从 activities 表关联（用于用户报名列表）
}

export interface CapacityInfo {
  activityId: number;
  capacity: number;
  approved: number;
  pending: number;
  waitlist: number;
  available: number;
  isFull: boolean;
}

// 获取状态文本
export function getStatusText(status: RegistrationStatus): string {
  switch (status) {
    case RegistrationStatus.CANCELLED:
      return 'Cancelled';
    case RegistrationStatus.PENDING:
      return 'Pending approval';
    case RegistrationStatus.APPROVED:
      return 'Approved';
    case RegistrationStatus.REJECTED:
      return 'Rejected';
    case RegistrationStatus.WAITLIST:
      return 'On waitlist';
    case RegistrationStatus.ATTENDED:
      return 'Attended';
    case RegistrationStatus.ABSENT:
      return 'Absent';
    default:
      return 'Unknown status';
  }
} 
