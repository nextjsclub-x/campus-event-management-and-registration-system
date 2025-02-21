import type { NextRequest } from 'next/server';
import { getActivitiesByOrganizer } from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { PaginationOptions } from '@/types/pagination.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证组织者ID
    const organizerId = Number.parseInt(params.id, 10);
    if (Number.isNaN(organizerId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的组织者ID',
        data: null,
      };
      return Response.json(response, { status: 400 });
    }

    // 2. 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(queryParams);

    // 3. 构建分页选项
    const options: PaginationOptions = {
      page: validatedParams.page || 1,
      limit: validatedParams.pageSize || 10,
    };

    // 4. 获取组织者的活动列表
    const activities = await getActivitiesByOrganizer(organizerId);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取组织者活动列表成功',
      data: activities,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取组织者活动列表失败:', error);

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
      message: '获取组织者活动列表失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
