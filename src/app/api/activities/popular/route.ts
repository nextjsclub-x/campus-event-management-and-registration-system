import type { NextRequest } from 'next/server';
import { getPopularActivities } from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  limit: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive().max(100))
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params);

    // 获取热门活动
    const activities = await getPopularActivities(validatedParams.limit || 10);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取热门活动成功',
      data: activities,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取热门活动失败:', error);

    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '参数验证失败',
        data: error.errors,
      };
      return Response.json(response, { status: 400 });
    }

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取热门活动失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
