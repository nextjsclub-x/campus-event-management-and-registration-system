import type { NextRequest } from 'next/server';
import { getUserNotifications } from '@/models/notification';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  pageSize: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive().max(100))
    .optional(),
});

type QueryParams = z.infer<typeof querySchema>;

export async function GET(request: NextRequest) {
  try {
    // TODO: 从认证中获取用户ID
    const userId = 1; // 临时写死，等待认证系统集成

    // 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params) as QueryParams;

    // 获取通知列表
    const result = await getUserNotifications(
      userId,
      { isRead: validatedParams.isRead },
      {
        page: validatedParams.page,
        pageSize: validatedParams.pageSize,
      }
    );

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取通知列表成功',
      data: result,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取通知列表失败:', error);

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
      message: '获取通知列表失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
