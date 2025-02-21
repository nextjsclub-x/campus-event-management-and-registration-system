import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserById, updateUser } from '@/models/user';
import { verifyPassword } from '@/utils/password_crypto';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { UserUpdatePasswordRequest } from '@/types/user.type';

export async function POST(request: NextRequest) {
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

    // 获取请求体
    const body: UserUpdatePasswordRequest = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供旧密码和新密码',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 获取用户信息
    const user = await getUserById(Number(userId));
    
    if (!user) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '未找到用户信息',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 验证旧密码
    const isPasswordValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '旧密码错误',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 更新密码
    await updateUser(user.id, {
      password: newPassword
    });

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '密码修改成功',
      data: null
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
