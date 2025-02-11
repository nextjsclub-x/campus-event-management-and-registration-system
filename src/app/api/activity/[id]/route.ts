import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/schema/api-response.schema';
import { getActivity, updateActivity, deleteActivity } from '@/service/activity.service';

/**
 * 获取单个活动详情
 * 
 * @param request - NextRequest对象
 * @param context - 包含路由参数的上下文对象
 * @returns 活动详细信息
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const activityId = parseInt(context.params.id, 10);
    const activity = await getActivity(activityId);

    if (!activity) {
      return NextResponse.json({
        code: 404,
        message: '活动不存在',
        data: null
      });
    }

    return NextResponse.json({
      code: 200,
      message: '获取活动详情成功',
      data: activity
    });

  } catch (error: any) {
    console.error('获取活动详情失败:', error);
    return NextResponse.json({
      code: 500,
      message: `获取活动详情失败: ${error.message}`,
      data: null
    });
  }
}

/**
 * 更新活动信息
 * 
 * 请求体参数说明：
 * @param {Object} requestBody - PUT请求体，所有字段都是可选的
 *   - organizerId: 组织者ID（必填，用于权限验证）
 *   - title: 活动标题
 *   - description: 活动描述
 *   - startTime: 开始时间，ISO格式的日期字符串
 *   - endTime: 结束时间，ISO格式的日期字符串
 *   - location: 活动地点
 *   - capacity: 活动容量，正整数
 *   - categoryId: 活动类别ID
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const activityId = parseInt(context.params.id, 10);
    const body = await request.json();

    // 验证组织者ID是否存在
    if (!body.organizerId) {
      return NextResponse.json({
        code: 400, // Bad Request
        message: '缺少组织者ID',
        data: null
      });
    }

    // 构建更新数据
    const updateData: any = {};
    const allowedFields = ['title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'categoryId'];
    
    allowedFields.forEach(field => {
      if (field in body) {
        if (field === 'startTime' || field === 'endTime') {
          updateData[field] = new Date(body[field]);
        } else if (field === 'capacity' || field === 'categoryId') {
          updateData[field] = parseInt(body[field], 10);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    const activity = await updateActivity(activityId, body.organizerId, updateData);

    return NextResponse.json({
      code: 200, // OK
      message: '更新活动成功',
      data: activity
    });

  } catch (error: any) {
    console.error('更新活动失败:', error);
    return NextResponse.json({
      code: 500, // Internal Server Error
      message: `更新活动失败: ${error.message}`,
      data: null
    });
  }
}

/**
 * 删除活动
 * 
 * 请求体参数说明：
 * @param {Object} requestBody - DELETE请求体
 *   - organizerId: 组织者ID（必填，用于权限验证）
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const activityId = parseInt(context.params.id, 10);
    const body = await request.json();

    // 验证组织者ID是否存在
    if (!body.organizerId) {
      return NextResponse.json({
        code: 400, // Bad Request
        message: '缺少组织者ID',
        data: null
      });
    }

    await deleteActivity(activityId, body.organizerId);

    return NextResponse.json({
      code: 200, // OK
      message: '删除活动成功',
      data: null
    });

  } catch (error: any) {
    console.error('删除活动失败:', error);
    return NextResponse.json({
      code: 500, // Internal Server Error
      message: `删除活动失败: ${error.message}`,
      data: null
    });
  }
} 
