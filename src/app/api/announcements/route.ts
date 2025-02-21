import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAnnouncement, listAnnouncements } from '@/models/announcement';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

// 查询参数验证schema
const querySchema = z.object({
  isPublished: z
    .string()
    .transform((val) => Number(val === 'true'))
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

// 创建公告的请求体验证schema
const createSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最长100字符'),
  content: z.string().min(1, '内容不能为空'),
  isPublished: z.number().optional(),
});

type QueryParams = z.infer<typeof querySchema>;
type CreateParams = z.infer<typeof createSchema>;

export async function GET(request: NextRequest) {
  try {
    // 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params) as QueryParams;

    // 获取公告列表
    const result = await listAnnouncements({
      isPublished: validatedParams.isPublished,
      page: validatedParams.page,
      pageSize: validatedParams.pageSize,
    });

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取公告列表成功',
      data: result,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取公告列表失败:', error);

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
      message: '获取公告列表失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = createSchema.parse(body) as CreateParams;

    const announcement = await createAnnouncement(validatedBody);

    const response: APIResponse = {
      code: APIStatusCode.CREATED,
      message: '创建公告成功',
      data: announcement,
    };
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('创建公告失败:', error);

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
      message: '创建公告失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
