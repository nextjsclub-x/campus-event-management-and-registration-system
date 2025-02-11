import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, APIStatusCode } from '@/schema/api-response.schema';
import { getCategoryById } from '@/service/category.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id, 10);
    if (Number.isNaN(categoryId)) {
      const res: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的分类ID',
        data: null
      };
      return NextResponse.json(res);
    }

    const category = await getCategoryById(categoryId);

    const res: APIResponse = {
      code: APIStatusCode.OK,
      message: '获取分类详情成功',
      data: category
    };
    return NextResponse.json(res);
  } catch (error: any) {
    if (error.message.includes('分类不存在')) {
      const res: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '分类不存在',
        data: null
      };
      return NextResponse.json(res);
    }

    const res: APIResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取分类详情失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
} 
