import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { checkActivityTimeConflict } from '@/service/activity.service';

export const runtime = 'nodejs';

// 检查活动时间冲突
export async function POST(request: NextRequest) {
  try {
    const organizerId = Number(request.headers.get('X-User-Id'));
    const { startTime, endTime, excludeActivityId } = await request.json();

    if (!organizerId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到组织者信息',
        data: null
      }, { status: 400 });
    }

    const conflicts = await checkActivityTimeConflict(
      organizerId,
      new Date(startTime),
      new Date(endTime),
      excludeActivityId
    );

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '检查时间冲突成功',
      data: conflicts
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '检查时间冲突失败',
        data: null
      },
      { status: 500 }
    );
  }
} 
