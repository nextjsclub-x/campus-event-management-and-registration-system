import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cancelRegistration } from '@/models/registration';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户登录状态
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const response: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 2. 验证报名ID
    const registrationId = Number.parseInt(params.id, 10);
    if (Number.isNaN(registrationId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的报名ID',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 取消报名
    await cancelRegistration(registrationId, Number(userId));

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '取消报名成功',
      data: null,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('取消报名失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '取消报名失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
