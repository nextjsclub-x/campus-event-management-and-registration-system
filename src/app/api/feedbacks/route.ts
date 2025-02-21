import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  createFeedback,
  getUserFeedbacks,
  getActivityFeedbacks,
} from '@/models/feedback';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 创建反馈请求验证schema
const createFeedbackSchema = z.object({
  activityId: z.number().int().positive('活动ID必须为正整数'),
  comment: z.string().min(1, '内容不能为空').max(500, '内容不能超过500个字符'),
  rating: z.number().int().min(1, '评分必须在1-5之间').max(5),
});

// 查询参数验证schema
const querySchema = z.object({
  activityId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
});

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

    // 2. 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params);

    // 3. 根据查询参数选择不同的查询方式
    const feedbacks = validatedParams.activityId
      ? await getActivityFeedbacks(validatedParams.activityId)
      : await getUserFeedbacks(Number(userId));

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取反馈列表成功',
      data: feedbacks,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取反馈列表失败:', error);

    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '参数验证失败',
        data: error.errors,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取反馈列表失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // 2. 获取并验证请求数据
    const body = await request.json();
    const result = createFeedbackSchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 创建反馈
    const feedback = await createFeedback({
      userId: Number(userId),
      activityId: result.data.activityId,
      comment: result.data.comment,
      rating: result.data.rating,
    });

    const response: APIResponse = {
      code: APIStatusCode.CREATED,
      message: '反馈创建成功',
      data: feedback,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('创建反馈失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '创建反馈失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
