import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  getFeedback,
  updateFeedback,
  deleteFeedback,
} from '@/models/feedback';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 更新反馈请求验证schema
const updateFeedbackSchema = z.object({
  comment: z.string().min(1, '内容不能为空').max(500, '内容不能超过500个字符'),
  rating: z.number().int().min(1, '评分必须在1-5之间').max(5),
});

export async function GET(
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

    // 2. 验证反馈ID
    const feedbackId = Number.parseInt(params.id, 10);
    if (Number.isNaN(feedbackId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的反馈ID',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 获取反馈
    const feedback = await getFeedback(feedbackId);
    
    // 4. 检查访问权限
    if (feedback.userId !== Number(userId)) {
      const response: APIResponse = {
        code: APIStatusCode.FORBIDDEN,
        message: '无权访问此反馈',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取反馈成功',
      data: feedback,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取反馈失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取反馈失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
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

    // 2. 验证反馈ID
    const feedbackId = Number.parseInt(params.id, 10);
    if (Number.isNaN(feedbackId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的反馈ID',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 获取并验证请求数据
    const body = await request.json();
    const result = updateFeedbackSchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 4. 更新反馈
    const feedback = await updateFeedback(feedbackId, Number(userId), {
      comment: result.data.comment,
      rating: result.data.rating,
    });

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '更新反馈成功',
      data: feedback,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新反馈失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '更新反馈失败',
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

    // 2. 验证反馈ID
    const feedbackId = Number.parseInt(params.id, 10);
    if (Number.isNaN(feedbackId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的反馈ID',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 删除反馈
    await deleteFeedback(feedbackId, Number(userId));

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '删除反馈成功',
      data: null,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('删除反馈失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '删除反馈失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
