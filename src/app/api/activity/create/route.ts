import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/schema/api-response.schema';
import { createActivity } from '@/service/activity.service';

/**
 * 创建新活动的 API 接口
 * 
 * 请求体参数说明：
 * @param {Object} requestBody - POST请求体
 *   - organizerId: 组织者ID（必填）
 *   - title: 活动标题（必填）
 *   - description: 活动描述（必填）
 *   - startTime: 开始时间，ISO格式的日期字符串（必填）
 *   - endTime: 结束时间，ISO格式的日期字符串（必填）
 *   - location: 活动地点（必填）
 *   - capacity: 活动容量，正整数（必填）
 *   - categoryId: 活动类别ID（必填）
 * 
 * 返回数据说明：
 * @returns {Object} 返回的数据结构
 *   - code: 状态码
 *   - message: 响应消息
 *   - data: 创建的活动信息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    const requiredFields = ['organizerId', 'title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'categoryId'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({
          code: 400, // Bad Request
          message: `缺少必填字段: ${field}`,
          data: null
        } as APIResponse);
      }
    }

    // 创建活动
    const activity = await createActivity(body.organizerId, {
      title: body.title,
      description: body.description,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      location: body.location,
      capacity: parseInt(body.capacity, 10),
      categoryId: parseInt(body.categoryId, 10)
    });

    const res: APIResponse = {
      code: 200, // OK
      message: '创建活动成功',
      data: activity
    };
    return NextResponse.json(res);

  } catch (error: any) {
    console.error('创建活动失败:', error);
    const res: APIResponse = {
      code: 500, // Internal Server Error
      message: `创建活动失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
} 
