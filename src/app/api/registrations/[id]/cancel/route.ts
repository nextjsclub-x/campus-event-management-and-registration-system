import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { cancelRegistration } from '@/service/registration.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const registrationId = parseInt(params.id, 10);
    if (Number.isNaN(registrationId)) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的报名ID',
        data: null
      };
      return NextResponse.json(res, { status: 400 });
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      const res: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      };
      return NextResponse.json(res, { status: 401 });
    }

    const registration = await cancelRegistration(registrationId, parseInt(userId, 10));

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '取消报名成功',
      data: registration
    };
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('取消报名失败:', error);
    const res: APIResponse = {
      code: error.status || APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '取消报名失败，请稍后重试',
      data: null
    };
    return NextResponse.json(res, { 
      status: error.status || 500 
    });
  }
} 