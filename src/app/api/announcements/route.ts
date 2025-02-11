import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getNotificationById
} from '@/service/notification.service';
import {
  createAnnouncementService,
  listAnnouncementsService,
} from '@/service/announcement.service';

export const runtime = 'nodejs';

// 获取公告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const isPublished = searchParams.get('isPublished') 
      ? Number(searchParams.get('isPublished')) 
      : undefined;
    
    // 从请求头获取用户ID
    const userId = Number(request.headers.get('X-User-Id'));
    
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到用户信息',
        data: null
      }, { status: 400 });
    }
    
    const result = await listAnnouncementsService({
      page,
      pageSize,
      isPublished
    });

    // 修改返回格式，确保符合 APIResponse 接口
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取公告列表成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取公告列表失败:', error);
    return NextResponse.json(
      {
        code: APIStatusCode.BAD_REQUEST,
        message: error.message || '获取公告列表失败',
        data: null
      },
      { status: 500 }
    );
  }
}

// 创建新公告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const announcement = await createAnnouncementService({
      title,
      content,
      isPublished
    });

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error('创建公告失败:', error);
    // 增加错误详情
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: `创建公告失败: ${error.message || '未知错误'}`,
      data: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 
