import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { changePassword } from '@/service/user.service';

export async function POST(req: NextRequest) {
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
    const { oldPassword, newPassword } = body;

    // 验证必要的字段
    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '原密码和新密码不能为空',
        data: null
      });
    }

    await changePassword(parseInt(userId, 10), oldPassword, newPassword);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '密码修改成功',
      data: null
    });
    
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: error.message,
        data: null
      });
    }
    
    console.error('修改密码失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '修改密码失败',
      data: null
    });
  }
}
