import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/schema/api-response.schema';
import { updateActivityStatus } from '@/service/activity.service';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const activityId = parseInt(context.params.id, 10);
    const organizerId = parseInt(request.headers.get('X-User-Id') || '0', 10);
    const body = await request.json();

    if (typeof body.status === 'undefined') {
      return NextResponse.json({
        code: 400,
        message: '缺少状态参数',
        data: null
      });
    }

    const activity = await updateActivityStatus(activityId, organizerId, body.status);

    return NextResponse.json({
      code: 200,
      message: '更新活动状态成功',
      data: activity
    });

  } catch (error: any) {
    console.error('更新活动状态失败:', error);
    return NextResponse.json({
      code: 500,
      message: `更新活动状态失败: ${error.message}`,
      data: null
    });
  }
} 
