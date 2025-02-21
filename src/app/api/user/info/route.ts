import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserById } from '@/models/user/get-user-by-id';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { UserInfo } from '@/types/user.type';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      const response: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '未登录或无效的用户信息',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    const user = await getUserById(Number(userId));
    
    if (!user) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '未找到用户信息',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    const response: APIResponse<UserInfo> = {
      code: APIStatusCode.SUCCESS,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
    
    return NextResponse.json(response, { status: response.code });
    
  } catch (error) {
    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '服务器错误',
      data: null
    };
    return NextResponse.json(response, { status: response.code });
  }
}
