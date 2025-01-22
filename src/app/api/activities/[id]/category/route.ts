import { NextRequest, NextResponse } from 'next/server';
import { APIJsonResponse, APIStatusCode } from '@/schema/api-response.schema';
import { setActivityCategory } from '@/models/category.model';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      };
      return NextResponse.json(res);
    }

    const { categoryId } = await request.json();
    if (!categoryId || Number.isNaN(parseInt(String(categoryId), 10))) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供有效的分类ID',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法设置活动分类
    const result = await setActivityCategory(activityId, parseInt(String(categoryId), 10));

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '设置活动分类成功',
      data: result
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理特定错误
    if (error.message === 'Activity not found') {
      const res: APIJsonResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '活动不存在',
        data: null
      };
      return NextResponse.json(res);
    }

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
      message: `设置活动分类失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
