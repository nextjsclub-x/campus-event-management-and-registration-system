'use server';

import { ActivityStatus } from '@/types/activity.types';
import { updateActivityStatus } from './update-activity-status';

export async function publishActivity(activityId: number, organizerId: number) {
  return updateActivityStatus(
    activityId,
    organizerId,
    ActivityStatus.PUBLISHED,
  );
} 
