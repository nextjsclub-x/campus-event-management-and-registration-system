import { NextRequest } from 'next/server';
import { getAuthData } from '@/lib/auth/utils';
import { createFeedback, getActivityFeedbacks } from '@/service/feedback.service';
import { getActivity } from '@/service/activity.service';

// GET: 获取反馈列表
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const activityId = Number(searchParams.get('activityId'));
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    if (!activityId) {
      return Response.json({
        code: 400,
        message: '缺少活动ID参数',
      }, { status: 400 });
    }

    // 验证活动是否存在
    await getActivity(activityId);

    const { feedbacks, stats, pagination } = await getActivityFeedbacks(activityId, page, pageSize);

    return Response.json({
      code: 200,
      message: 'success',
      data: {
        feedbacks,
        total: pagination.total,
        stats,
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

// POST: 创建新反馈
export async function POST(request: NextRequest) {
  try {
    const authData = await getAuthData();
    
    if (!authData?.id) {
      return Response.json({
        code: 401,
        message: '未登录',
      }, { status: 401 });
    }

    const body = await request.json();
    const { activityId, rating, comment } = body;

    // 参数验证
    if (!activityId || !rating || !comment) {
      return Response.json({
        code: 400,
        message: '缺少必要参数',
      }, { status: 400 });
    }

    // 评分范围验证
    if (rating < 1 || rating > 5) {
      return Response.json({
        code: 400,
        message: '评分必须在1-5之间',
      }, { status: 400 });
    }

    const feedback = await createFeedback({
      userId: authData.id,
      activityId,
      rating,
      comment,
    });

    return Response.json({
      code: 200,
      message: '反馈创建成功',
      data: feedback
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
} 
