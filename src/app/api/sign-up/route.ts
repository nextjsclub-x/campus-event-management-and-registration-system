import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode, APIResponse } from '@/schema/api-response.schema';
import { registerUser } from '@/service/user.service';
import { UserRole } from '@/schema/user.schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'student', studentId } = await request.json();

    // 1. 基础参数验证
    if (!email || !password || !name) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供所有必需的注册信息',
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

    // 3. 密码强度验证
    if (password.length < 6) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '密码长度至少为6位',
        data: null
      }, { status: 400 });
    }

    // 4. 用户名长度验证
    if (name.length < 2 || name.length > 20) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '用户名长度应在2-20个字符之间',
        data: null
      }, { status: 400 });
    }

    // 5. 角色验证
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的用户角色',
        data: null
      }, { status: 400 });
    }

    // 6. 学号验证（如果提供）
    if (studentId) {
      if (!/^\d{8,12}$/.test(studentId)) {
        return NextResponse.json({
          code: APIStatusCode.BAD_REQUEST,
          message: '学号格式不正确（应为8-12位数字）',
          data: null
        }, { status: 400 });
      }
    }

    // 7. 调用service层进行注册
    const user = await registerUser(email, password, name, role as UserRole, studentId);

    // 8. 返回成功响应
    return NextResponse.json({
      code: APIStatusCode.CREATED,
      message: '用户注册成功',
      data: user
    }, { status: 201 });

  } catch (error: any) {
    // 改用错误名称检查，而不是 instanceof
    if (error.name === 'EmailExistsError') {
      return NextResponse.json({
        code: APIStatusCode.CONFLICT,
        message: error.message,
        data: {
          suggestLogin: true
        }
      }, { status: 409 });
    }

    // 记录其他未预期的错误
    console.error('注册错误:', error);

    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '注册失败，请稍后重试',
      data: null
    }, { status: 500 });
  }
}
