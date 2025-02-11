import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getUserInfo, updateUserProfileService } from '@/service/user.service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    const user = await getUserInfo(parseInt(userId, 10));
    if (!user) {
      return NextResponse.json({
        code: APIStatusCode.NOT_FOUND,
        message: '用户不存在',
        data: null
      });
    }

    // 只返回安全的用户信息
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取成功',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '获取用户信息失败',
      data: null
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    const body = await req.json();
    const { name, email, password } = body;

    // 验证必要的字段
    if (name && name.trim().length === 0) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '用户名不能为空',
        data: null
      });
    }

    const updatedUser = await updateUserProfileService(parseInt(userId, 10), {
      name: name?.trim(),
      email,
      password
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '更新成功',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: error.message,
        data: null
      });
    }
    
    console.error('更新用户信息失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '更新用户信息失败',
      data: null
    });
  }
} 
