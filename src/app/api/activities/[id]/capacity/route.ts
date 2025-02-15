import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { 
  updateActivityCapacity,
  checkActivityCapacity 
} from '@/service/activity.service';

export const runtime = 'nodejs';

// 获取活动容量信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const capacity = await checkActivityCapacity(id);
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取活动容量信息成功',
      data: capacity
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取活动容量信息失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 更新活动容量
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const organizerId = Number(request.headers.get('X-User-Id'));
    const { capacity } = await request.json();

    if (!organizerId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到组织者信息',
        data: null
      }, { status: 400 });
    }

    const activity = await updateActivityCapacity(id, organizerId, capacity);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '更新活动容量成功',
      data: activity
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '更新活动容量失败',
        data: null
      },
      { status: 500 }
    );
  }
} 
