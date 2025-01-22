import { NextRequest, NextResponse } from 'next/server';
import { APIJsonResponse , APIStatusCode } from '@/schema/api-response.schema';
import { getActivitiesByCategory } from '@/models/category.model';

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

    // 获取查询参数
    const {searchParams} = request.nextUrl;
    const filters = {
      status: searchParams.has('status') ? parseInt(searchParams.get('status')!, 10) : undefined,
      startTime: searchParams.has('startTime') ? new Date(searchParams.get('startTime')!) : undefined,
      endTime: searchParams.has('endTime') ? new Date(searchParams.get('endTime')!) : undefined
    };

    const page = searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.has('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 10;

    // 调用model层方法获取分类下的活动
    const result = await getActivitiesByCategory(categoryId, filters, { page, pageSize });

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取分类活动列表成功',
      data: result
    };
    return NextResponse.json(res);
  } catch (error: any) {
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取分类活动列表失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
