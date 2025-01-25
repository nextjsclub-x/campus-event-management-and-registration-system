import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { registerActivity } from '@/models/registration.model';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    console.log('从 header 获取的用户信息:', {
      userId,
      allHeaders: Object.fromEntries(req.headers.entries())
    });

    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    // 创建报名记录
    const registration = await registerActivity(parseInt(userId, 10), activityId);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '报名成功',
      data: registration
    });
  } catch (error: any) {
    console.error('活动报名失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '报名失败，请稍后重试',
      data: null
    });
  }
}
