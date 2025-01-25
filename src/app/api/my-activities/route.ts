import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getActivitiesByOrganizer } from '@/models/activity.model';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    const activities = await getActivitiesByOrganizer(parseInt(userId, 10));
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取成功',
      data: {
        activities
      }
    });
  } catch (error) {
    console.error('获取我的活动列表失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '获取活动列表失败',
      data: null
    });
  }
} 
