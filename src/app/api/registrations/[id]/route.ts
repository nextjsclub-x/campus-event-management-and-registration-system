import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { RegistrationStatus  , updateRegistrationStatus } from '@/models/registration.model';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const registrationId = parseInt(params.id, 10);
    if (Number.isNaN(registrationId)) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的报名ID',
        data: null
      };
      return NextResponse.json(res);
    }

    // 从请求中获取用户ID（用于权限验证）
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      const res: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      };
      return NextResponse.json(res);
    }

    // 获取请求体数据
    const body = await req.json();
    const { status } = body;

    if (typeof status !== 'number') {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的状态值',
        data: null
      };
      return NextResponse.json(res);
    }

    // 更新报名状态
    const updatedRegistration = await updateRegistrationStatus(registrationId, status, parseInt(userId, 10));

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '更新报名状态成功',
      data: updatedRegistration
    };
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('更新报名状态失败:', error);
    const res: APIResponse = {
      code: error.status || APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '更新报名状态失败，请稍后重试',
      data: null
    };
    return NextResponse.json(res
    );
  }
}
