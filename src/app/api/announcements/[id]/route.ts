import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
  getNotificationById,
  markNotificationAsRead
} from '@/service/notification.service';
import {
  getAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService,
  publishAnnouncementService
} from '@/service/announcement.service';

export const runtime = 'nodejs';

// 获取单个公告详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const announcement = await getAnnouncementService(id);
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取公告详情成功',
      data: announcement
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取公告详情失败',
        data: null
      },
      { status: error.message === '公告不存在' ? 404 : 500 }
    );
  }
}

// 标记公告为已读
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const { isPublished } = await request.json();

    if (typeof isPublished !== 'number') {
      return NextResponse.json(
        {
          code: APIStatusCode.BAD_REQUEST,
          message: '发布状态参数无效',
          data: null
        },
        { status: 400 }
      );
    }

    const announcement = await publishAnnouncementService(id, isPublished);
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: isPublished ? '发布公告成功' : '取消发布成功',
      data: announcement
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '更新发布状态失败',
        data: null
      },
      { status: error.message === '公告不存在或已被删除' ? 404 : 500 }
    );
  }
}

// PUT 更新公告
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { title, content, isPublished } = body;

    const announcement = await updateAnnouncementService(id, {
      title,
      content,
      isPublished
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '更新公告成功',
      data: announcement
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '更新公告失败',
        data: null
      },
      { status: error.message === '公告不存在' ? 404 : 500 }
    );
  }
}

// DELETE 删除公告
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const announcement = await deleteAnnouncementService(id);
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '删除公告成功',
      data: announcement
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '删除公告失败',
        data: null
      },
      { status: error.message === '公告不存在或已被删除' ? 404 : 500 }
    );
  }
} 
