import { NextRequest, NextResponse } from 'next/server';
import { APIJsonResponse, APIStatusCode } from '@/schema/api-response.schema';
import { getCategoryStats } from '@/models/category.model';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = parseInt(params.id, 10);
    if (Number.isNaN(categoryId)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的分类ID',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法获取分类统计信息
    const stats = await getCategoryStats(categoryId);

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取分类统计信息成功',
      data: stats
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理特定错误
    if (error.message === 'Category not found') {
      const res: APIJsonResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '分类不存在',
        data: null
      };
      return NextResponse.json(res);
    }

    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取分类统计信息失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
