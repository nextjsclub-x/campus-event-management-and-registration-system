import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import db from '@/database/neon.db';
import { eq } from 'drizzle-orm';
import { registrations } from '@/schema/db.schema';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const registrationId = parseInt(params.id, 10);
    const { status } = await req.json();

    if (Number.isNaN(registrationId)) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的报名ID',
        data: null
      });
    }

    // 更新报名状态
    const [updatedRegistration] = await db.update(registrations)
      .set({
        status
      })
      .where(eq(registrations.id, registrationId))
      .returning();

    if (!updatedRegistration) {
      return NextResponse.json({
        code: APIStatusCode.NOT_FOUND,
        message: '报名记录不存在',
        data: null
      });
    }

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '审核成功',
      data: updatedRegistration
    });
  } catch (error: any) {
    console.error('审核报名失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: error.message || '审核失败',
      data: null
    });
  }
} 
