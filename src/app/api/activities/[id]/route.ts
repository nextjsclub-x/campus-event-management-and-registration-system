import { NextRequest, NextResponse } from 'next/server';
import { getActivity, updateActivity, deleteActivity } from '@/models/activity.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = Number(params.id);

    // 参数验证
    if (Number.isNaN(activityId)) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动ID',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法获取活动详情
    const activity = await getActivity(activityId);

    if (!activity) {
      const res: APIJsonResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '活动不存在',
        data: null
      };
      return NextResponse.json(res);
    }

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取活动详情成功',
      data: activity
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取活动详情时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = parseInt(params.id, 10);
    const updateData = await request.json();

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

    // 处理日期字段
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    // 调用model层方法更新活动，使用现有活动的 organizerId
    const updatedActivity = await updateActivity(activityId, existingActivity.organizerId, updateData);

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '活动更新成功',
      data: updatedActivity
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `更新活动时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activityId = Number(params.id);

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

    // 调用model层方法删除活动
    const {organizerId} = existingActivity; 

    const deletedActivity = await deleteActivity(activityId, organizerId);

    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '活动删除成功',
      data: deletedActivity
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `删除活动时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
