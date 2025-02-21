import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDashboardStatistics } from '@/models/analytics/get-dashboard-statistics';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { DashboardStatistics } from '@/models/analytics/get-dashboard-statistics';

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
      return NextResponse.json(response, { status: response.code });
    }

    // 2. 获取统计数据
    const statistics = await getDashboardStatistics();

    // 3. 返回成功响应
    const response: APIResponse<DashboardStatistics> = {
      code: APIStatusCode.SUCCESS,
      message: '获取统计数据成功',
      data: statistics,
    };
    return NextResponse.json(response, { status: response.code });

  } catch (error) {
    console.error('获取统计数据失败:', error);

    // 处理错误
    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取统计数据失败',
      data: null,
    };
    return NextResponse.json(response, { status: response.code });
  }
}
