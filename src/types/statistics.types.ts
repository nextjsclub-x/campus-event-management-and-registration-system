import { ActivityStatus, type ActivityStatusType } from '@/types/activity.types';
import { RegistrationStatus } from '@/schema/registration.schema';

export { ActivityStatus, type ActivityStatusType, RegistrationStatus };

export interface ActivityCount {
  status: number;
  count: number;
}

export interface PopularActivity {
  activityId: number;
  title: string;
  registrationCount: number;
}

export interface StatusDataItem extends ActivityCount {
  name: string;
}

export interface ActivityStatistics {
  statusCount: ActivityCount[];
  recentActivities: { date: string; count: number }[];
  popularActivities: PopularActivity[];
}

export interface RegistrationStatistics {
  totalCount: number;
  statusCount: ActivityCount[];
  recentRegistrations: { date: string; count: number }[];
}

export interface CategoryStatistics {
  categoryActivityCount: { categoryId: number; categoryName: string | null; count: number }[];
  categoryRegistrationCount: { categoryId: number; categoryName: string | null; registrationCount: number }[];
}

export interface OverviewStatistics {
  totalActivities: number;
  newActivitiesThisMonth: number;
  totalRegistrations: number;
  newRegistrationsThisMonth: number;
} 
