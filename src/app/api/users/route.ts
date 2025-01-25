import { NextResponse } from 'next/server';
import { APIJsonResponse, APIStatusCode } from '@/schema/api-response.schema';
import { listUsers } from '@/models/userl.model';

export async function GET() {
  try {
    // 调用model层方法获取用户列表，提供默认的分页参数
    const users = await listUsers({}, { page: 1, pageSize: 10 });

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取用户列表成功',
      data: {
        users
      }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取用户列表失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
