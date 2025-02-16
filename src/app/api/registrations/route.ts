import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { createRegistration, getRegistrations } from '@/service/registration.service';

// 创建报名
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      const res: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      };
      return NextResponse.json(res, { status: 401 });
    }

    const body = await req.json();
    const { activityId } = body;

    if (!activityId) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '缺少活动ID',
        data: null
      };
      return NextResponse.json(res, { status: 400 });
    }

    const registration = await createRegistration(parseInt(userId, 10), activityId);

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '报名成功',
      data: registration
    };
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('创建报名失败:', error);
    const res: APIResponse = {
      code: error.status || APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '报名失败，请稍后重试',
      data: null
    };
    return NextResponse.json(res, { 
      status: error.status || 500 
    });
  }
}

// 获取报名列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get('activityId');
    const status = searchParams.get('status');

    if (!activityId) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '缺少活动ID',
        data: null
      };
      return NextResponse.json(res, { status: 400 });
    }

    const registrations = await getRegistrations(
      parseInt(activityId, 10),
      status ? parseInt(status, 10) : undefined
    );

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '获取报名列表成功',
      data: registrations
    };
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('获取报名列表失败:', error);
    const res: APIResponse = {
      code: error.status || APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '获取报名列表失败，请稍后重试',
      data: null
    };
    return NextResponse.json(res, { 
      status: error.status || 500 
    });
  }
} 