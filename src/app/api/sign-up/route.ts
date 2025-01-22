import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/models/userl.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // 参数验证
    if (!email || !password || !name) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供所有必需的注册信息',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层的register方法，默认role为'user'
    const user = await register(email, password, name, 'user');

    const res: APIJsonResponse = {
      code: APIStatusCode.CREATED,
      message: '用户注册成功',
      data: user
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理特定错误
    if (error.message === 'Email already registered') {
      const res: APIJsonResponse = {
        code: APIStatusCode.CONFLICT,
        message: '该邮箱已被注册',
        data: null
      };
      return NextResponse.json(res);
    }

    // 其他未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `注册过程中发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
