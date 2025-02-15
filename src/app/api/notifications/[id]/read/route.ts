import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { markNotificationAsRead } from '@/service/notification.service';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const notification = await markNotificationAsRead(id);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '标记通知已读成功',
      data: notification
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '标记通知已读失败',
        data: null
      },
      { status: 500 }
    );
  }
} 
