import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import db from '@/database/neon.db';
import { desc, sql } from 'drizzle-orm';
import { registrations } from '@/schema/registration.schema';
import { activities } from '@/schema/activity.schema';
import { users } from '@/schema/user.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const offset = (page - 1) * pageSize;

    // 获取所有报名记录，关联活动和用户信息
    const registrationList = await db.select({
      id: registrations.id,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      userId: registrations.userId,
      activityId: registrations.activityId,
      userName: users.name,
      userEmail: users.email,
      activityTitle: activities.title,
      activityStartTime: activities.startTime,
    })
      .from(registrations)
      .leftJoin(users, sql`${registrations.userId} = ${users.id}`)
      .leftJoin(activities, sql`${registrations.activityId} = ${activities.id}`)
      .orderBy(desc(registrations.registeredAt))
      .limit(pageSize)
      .offset(offset);

    // 获取总数
    const [{ count }] = await db.select({
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(registrations);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取报名记录成功',
      data: {
        registrations: registrationList,
        pagination: {
          current: page,
          pageSize,
          total: count,
          totalPages: Math.ceil(count / pageSize)
        }
      }
    });
  } catch (error: any) {
    console.error('获取报名记录失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '获取报名记录失败',
      data: null
    });
  }
} 
