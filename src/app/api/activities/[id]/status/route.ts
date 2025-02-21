import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  updateActivityStatus,
} from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { ActivityStatus, type ActivityStatusType } from '@/types/activity.types';
import { z } from 'zod';

// 更新状态请求验证schema
const updateStatusSchema = z.object({
  status: z
    .number()
    .refine(
      (val): val is ActivityStatusType =>
        Object.values(ActivityStatus).includes(val as ActivityStatusType),
      { message: '无效的活动状态' }
    ),
  reason: z.string().optional(), // 状态变更原因（可选）
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 2. 验证活动ID
    const activityId = Number.parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null,
      };
      return Response.json(response, { status: 400 });
    }

    // 3. 获取并验证请求数据
    const body = await request.json();
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 4. 更新活动状态
    const { status } = result.data;
    const activity = await updateActivityStatus(activityId, Number(userId), status);

    // 5. 返回成功响应
    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '活动状态更新成功',
      data: activity,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('更新活动状态失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : '更新活动状态失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
