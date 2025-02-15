import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { 
  createActivity,
  listActivities
} from '@/service/activity.service';

export const runtime = 'nodejs';

// 获取活动列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId') 
      ? Number(searchParams.get('categoryId')) 
      : undefined;

    const result = await listActivities({
      page,
      pageSize,
      status: status as any,
      categoryId
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取活动列表成功',
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取活动列表失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 创建新活动
export async function POST(request: NextRequest) {
  try {
    const organizerId = Number(request.headers.get('X-User-Id'));
    if (!organizerId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到组织者信息',
        data: null
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, location, capacity, categoryId } = body;

    if (!title || !description || !startTime || !endTime || !location || !capacity || !categoryId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '缺少必要参数',
        data: null
      }, { status: 400 });
    }

    const activity = await createActivity(organizerId, {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      capacity,
      categoryId
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '创建活动成功',
      data: activity
    });
  } catch (error: any) {
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '创建活动失败',
      data: null
    }, { status: 500 });
  }
} 
