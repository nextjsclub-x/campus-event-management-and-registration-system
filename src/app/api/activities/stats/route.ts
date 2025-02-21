import type { NextRequest } from 'next/server';
import { 
  getActivityStatusCount,
  getRecentActivityCount 
} from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function GET(request: NextRequest) {
  try {
    // 获取活动状态统计
    const [statusCount, recentCount] = await Promise.all([
      getActivityStatusCount(),
      getRecentActivityCount(),
    ]);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取活动统计信息成功',
      data: {
        statusCount,
        recentCount,
      },
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取活动统计信息失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取活动统计信息失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
