import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  getActivity,
  updateActivity,
  deleteActivity 
} from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';
import { ActivityStatus } from '@/types/activity.types';

// 更新活动请求验证schema
const updateActivitySchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题不能超过255个字符').optional(),
  description: z.string().min(1, '描述不能为空').optional(),
  startTime: z.string().datetime('开始时间格式不正确').optional(),
  endTime: z.string().datetime('结束时间格式不正确').optional(),
  location: z.string().min(1, '地点不能为空').max(255, '地点不能超过255个字符').optional(),
  capacity: z.number().int().positive('容量必须为正整数').optional(),
  categoryId: z.number().int().positive('类别ID必须为正整数').optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  },
  {
    message: '开始时间必须早于结束时间',
    path: ['startTime'],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = Number.parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null,
      };
      return Response.json(response, { status: 400 });
    }

    const activity = await getActivity(activityId);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取活动详情成功',
      data: activity,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取活动详情失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取活动详情失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
}

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
    const result = updateActivitySchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 4. 更新活动
    const activity = await updateActivity(activityId, Number(userId), {
      ...result.data,
      startTime: result.data.startTime ? new Date(result.data.startTime) : undefined,
      endTime: result.data.endTime ? new Date(result.data.endTime) : undefined,
    });

    // 5. 返回成功响应
    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '活动更新成功',
      data: activity,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('更新活动失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '更新活动失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
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

    // 3. 删除活动
    await deleteActivity(activityId, Number(userId));

    // 4. 返回成功响应
    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '活动删除成功',
      data: null,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('删除活动失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '删除活动失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
