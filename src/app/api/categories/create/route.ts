import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createCategory } from '@/models/category';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { CategoryStatus } from '@/types/category.types';
import { z } from 'zod';

// 创建分类请求验证schema
const createCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符'),
  description: z.string().max(500, '分类描述不能超过500个字符').optional(),
  status: z
    .number()
    .refine(
      (val) => Object.values(CategoryStatus).includes(val),
      { message: '无效的分类状态' }
    )
    .default(CategoryStatus.ACTIVE),
});

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
    const result = createCategorySchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 创建分类
    const category = await createCategory(result.data);

    // 4. 返回成功响应
    const response: APIResponse = {
      code: APIStatusCode.CREATED,
      message: '分类创建成功',
      data: category,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('创建分类失败:', error);

    // 处理其他错误
    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '创建分类失败',
      data: null,
    };
    return NextResponse.json(response, { status: response.code });
  }
} 
