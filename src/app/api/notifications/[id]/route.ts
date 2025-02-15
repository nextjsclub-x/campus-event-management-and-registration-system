import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getNotificationById } from '@/service/notification.service';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const notification = await getNotificationById(id);
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取通知详情成功',
      data: notification
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取通知详情失败',
        data: null
      },
      { status: 500 }
    );
  }
} 
