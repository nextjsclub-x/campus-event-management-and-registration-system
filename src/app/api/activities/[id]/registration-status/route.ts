import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getRegistrationStatus } from '@/models/registration.model';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      });
    }

    // 从请求中获取用户ID
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    // 获取报名状态
    const status = await getRegistrationStatus(parseInt(userId, 10), activityId);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取报名状态成功',
      data: status
    });
  } catch (error: any) {
    console.error('获取报名状态失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '获取报名状态失败，请稍后重试',
      data: null
    });
  }
} 
