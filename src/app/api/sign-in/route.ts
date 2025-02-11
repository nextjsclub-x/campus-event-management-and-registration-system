import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { serverLoginUser } from '@/service/user.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. 基础参数验证
    if (!email || !password) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供邮箱和密码',
        data: null
      }, { status: 400 });
    }

    // 2. 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '邮箱格式不正确',
        data: null
      }, { status: 400 });
    }

    // 3. 调用service层进行登录
    const loginResult = await serverLoginUser(email, password);

    // 4. 返回成功响应
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '登录成功',
      data: loginResult.data
    }, { status: 200 });

  } catch (error: any) {
    console.error('登录错误:', error);

    return NextResponse.json({
      code: APIStatusCode.UNAUTHORIZED,
      message: typeof error === 'string' ? error : '登录失败，请检查邮箱和密码',
      data: null
    }, { status: 401 });
  }
}
