import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { reviewActivity, rejectActivity } from '@/service/activity.service';

export const runtime = 'nodejs';

// 审核活动
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const reviewerId = Number(request.headers.get('X-User-Id'));
    const { approved, reason } = await request.json();

    if (!reviewerId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到审核者信息',
        data: null
      }, { status: 400 });
    }

    const activity = await reviewActivity(id, approved, reviewerId, reason);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: approved ? '审核通过成功' : '审核拒绝成功',
      data: activity
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '审核活动失败',
        data: null
      },
      { status: 500 }
    );
  }
} 
