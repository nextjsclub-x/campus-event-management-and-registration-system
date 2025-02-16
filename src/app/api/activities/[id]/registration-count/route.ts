import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { getActivityRegistrationCount } from '@/service/registration.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      };
      return NextResponse.json(res, { status: 400 });
    }

    const count = await getActivityRegistrationCount(activityId);

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '获取报名人数成功',
      data: { count }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('获取报名人数失败:', error);
    const res: APIResponse = {
      code: error.status || APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '获取报名人数失败，请稍后重试',
      data: null
    };
    return NextResponse.json(res, { 
      status: error.status || 500 
    });
  }
} 