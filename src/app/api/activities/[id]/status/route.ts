import { NextRequest, NextResponse } from 'next/server';
import { getActivity, updateActivityStatus } from '@/models/activity.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    const { status } = await request.json();

    // 参数验证
    if (Number.isNaN(activityId)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      };
      return NextResponse.json(res);
    }

    if (status === undefined || Number.isNaN(status)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的状态值',
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

    // 验证状态转换规则
    const currentStatus = existingActivity.status;
    const isValidTransition = (
      (currentStatus === 1 && (status === 2 || status === 0)) || // 草稿 -> 已发布、已删除
      (currentStatus === 2 && (status === 3 || status === 4)) || // 已发布 -> 已取消、已结束
      ((currentStatus === 3 || currentStatus === 4) && status === 0) // 已取消、已结束 -> 已删除
    );

    if (!isValidTransition) {
      const res: APIJsonResponse = {
        code: APIStatusCode.UNPROCESSABLE_ENTITY,
        message: '非法的状态转换',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法更新活动状态
    const updatedActivity = await updateActivityStatus(activityId, existingActivity.organizerId, status);

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '活动状态更新成功',
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
      message: `更新活动状态时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
