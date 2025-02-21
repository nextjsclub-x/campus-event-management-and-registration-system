import type { NextRequest } from 'next/server';
import { getCategoryStats } from '@/models/category';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = Number.parseInt(params.id, 10);
    if (Number.isNaN(categoryId)) {
      return Response.json(
        {
          code: APIStatusCode.BAD_REQUEST,
          message: '无效的分类ID',
          data: null,
        },
        { status: 400 }
      );
    }

    // 获取分类统计信息
    const stats = await getCategoryStats(categoryId);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取分类统计信息成功',
      data: stats,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取分类统计信息失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取分类统计信息失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
