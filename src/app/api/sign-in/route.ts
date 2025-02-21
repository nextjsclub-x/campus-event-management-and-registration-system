import { NextResponse } from 'next/server';
import { login } from '@/models/user/login';
import { z } from 'zod';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { UserPayload } from '@/types/user.type';

// 登录请求体验证schema
const signInSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const result = signInSchema.safeParse(body);
    if (!result.success) {
      // 参数验证失败响应
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    const { email, password } = result.data;

    // 调用登录服务
    const { token, user } = await login(email, password);

    // 登录成功响应
    const response: APIResponse<{ token: string; user: UserPayload }> = {
      code: APIStatusCode.SUCCESS,
      message: '登录成功',
      data: {
        token,
        user: {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          status: String(user.status),
          studentId: user.studentId,
        },
      },
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error: unknown) {
    // 处理用户不存在或密码错误
    if (error instanceof Error) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 处理其他未知服务器错误
    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '服务器错误',
      data: null,
    };
    return NextResponse.json(response, { status: response.code });
  }
}
