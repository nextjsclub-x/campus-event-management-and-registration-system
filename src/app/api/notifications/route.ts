import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { 
  getUserNotifications,
  createNotification 
} from '@/service/notification.service';

export const runtime = 'nodejs';

// 获取通知列表
export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.headers.get('X-User-Id'));
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const isRead = searchParams.get('isRead') === 'true';

    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到用户信息',
        data: null
      }, { status: 400 });
    }

    const result = await getUserNotifications(
      userId,
      { isRead },
      { page, pageSize }
    );

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取通知列表成功',
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取通知列表失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 创建通知
export async function POST(request: NextRequest) {
  try {
    const userId = Number(request.headers.get('X-User-Id'));
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到用户信息',
        data: null
      }, { status: 400 });
    }

    const { activityId, message } = await request.json();
    
    const notification = await createNotification(userId, activityId, message);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '创建通知成功',
      data: notification
    });
  } catch (error: any) {
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '创建通知失败',
      data: null
    }, { status: 500 });
  }
} 
