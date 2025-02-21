import type { NextRequest } from 'next/server';
import { getCategories } from '@/models/category';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { CategoryStatus, type CategoryStatusType } from '@/types/category.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  status: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(
      z.number().refine(
        (val): val is CategoryStatusType =>
          Object.values(CategoryStatus).includes(val as CategoryStatusType),
        { message: '无效的分类状态' },
      ),
    )
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
  keyword: z.string().optional(),
});

type QueryParams = z.infer<typeof querySchema>;

export async function GET(request: NextRequest) {
  try {
    // 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params) as QueryParams;

    // 获取分类列表
    const categories = await getCategories();

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取分类列表成功',
      data: categories,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取分类列表失败:', error);

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
      message: '获取分类列表失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
