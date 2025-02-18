import type { NextRequest } from 'next/server';
import {
  getActivityFeedbacks,
  getActivityRatingStats
} from '@/service/feedback.service';
import { getActivity } from '@/service/activity.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = Number(params.id);
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    // 验证活动是否存在
    await getActivity(activityId);

    // 获取反馈列表和统计信息
    const [
      { feedbacks, pagination },
      ratingStats
    ] = await Promise.all([
      getActivityFeedbacks(activityId, page, pageSize),
      getActivityRatingStats(activityId)
    ]);

    return Response.json({
      code: 200,
      message: 'success',
      data: {
        feedbacks,
        total: pagination.total,
        stats: ratingStats,
        pagination
      }
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
} 
