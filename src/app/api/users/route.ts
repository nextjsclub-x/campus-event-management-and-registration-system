import { NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { getUserList } from '@/service/user.service';

export async function GET() {
  try {
    // 调用model层方法获取用户列表，提供默认的分页参数
    const users = await getUserList({}, { page: 1, pageSize: 10 });

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '获取用户列表成功',
      data: {
        users
      }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取用户列表失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
