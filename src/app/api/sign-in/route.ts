import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/models/userl.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 参数验证
    if (!email || !password) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供邮箱和密码',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层的login方法进行验证并获取token
    const { token, userId, role } = await login(email, password);

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '登录成功',
      data: {
        token,
        userId,
        role
      }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理特定错误
    if (error.message === 'User not found' || error.message === 'Invalid credentials') {
      const res: APIJsonResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '邮箱或密码错误',
        data: null
      };
      return NextResponse.json(res);
    }

    // 其他未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '登录过程中发生错误',
      data: null
    };
    return NextResponse.json(res);
  }
}
