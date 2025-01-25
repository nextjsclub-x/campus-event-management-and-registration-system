import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getActivityRegistrations } from '@/models/registration.model';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    if (Number.isNaN(activityId)) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      });
    }

    // 获取报名列表
    const result = await getActivityRegistrations(activityId);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取报名列表成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取报名列表失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '获取报名列表失败，请稍后重试',
      data: null
    });
  }
}
