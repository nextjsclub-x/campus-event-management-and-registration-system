import { NextRequest, NextResponse } from 'next/server';
import { getActivity, updateActivity } from '@/models/activity.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);

    // 参数验证
    if (Number.isNaN(activityId)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      };
      return NextResponse.json(res);
    }

    // 检查活动是否存在
    const existingActivity = await getActivity(activityId);
    if (!existingActivity) {
      const res: APIJsonResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '活动不存在',
        data: null
      };
      return NextResponse.json(res);
    }

    // 验证活动状态
    if (existingActivity.status !== 2) { // 只有已发布状态的活动可以取消发布
      const res: APIJsonResponse = {
        code: APIStatusCode.UNPROCESSABLE_ENTITY,
        message: '只有已发布状态的活动可以取消发布',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法更新活动状态为已取消
    const updatedActivity = await updateActivity(activityId, 3, {});

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '活动取消发布成功',
      data: {
        id: updatedActivity.id,
        status: updatedActivity.status,
        updatedAt: updatedActivity.updatedAt
      }
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `取消发布活动时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
