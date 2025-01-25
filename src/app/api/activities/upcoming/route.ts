import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import db from '@/database/neon.db';
import { activities, registrations } from '@/schema/db.schema';
import { and, eq, gt, lt, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      });
    }

    // 获取24小时内开始的活动
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingActivities = await db
      .select({
        id: activities.id,
        title: activities.title,
        startTime: activities.startTime,
      })
      .from(activities)
      .innerJoin(
        registrations,
        and(
          eq(registrations.activityId, activities.id),
          eq(registrations.userId, parseInt(userId, 10)),
          eq(registrations.status, 2) // 只查询已批准的报名
        )
      )
      .where(
        and(
          eq(activities.status, 2), // 已发布的活动
          gt(activities.startTime, now),
          lt(activities.startTime, next24Hours)
        )
      )
      .orderBy(activities.startTime);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取成功',
      data: {
        activities: upcomingActivities
      }
    });
  } catch (error) {
    console.error('获取即将开始的活动失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '获取即将开始的活动失败',
      data: null
    });
  }
} 
