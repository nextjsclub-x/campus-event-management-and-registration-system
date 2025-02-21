import type { NextRequest } from 'next/server';
import { 
  getRegistrationStatusCount,
  getRecentRegistrationCount 
} from '@/models/registration';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const response: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null,
      };
      return Response.json(response, { status: 401 });
    }

    // 2. 获取各项统计数据
    const [statusCount, recentCount] = await Promise.all([
      getRegistrationStatusCount(),
      getRecentRegistrationCount(),
    ]);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取报名统计信息成功',
      data: {
        statusCount,
        recentCount,
      },
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取报名统计信息失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取报名统计信息失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
