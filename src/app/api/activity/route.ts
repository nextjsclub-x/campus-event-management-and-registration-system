import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/schema/api-response.schema';
import { listActivities, ActivityStatusType } from '@/service/activity.service';

/**
 * 获取活动列表的 API 接口
 *
 * 请求参数说明：
 * @param {number} status - 活动状态过滤
 *   - 0: 草稿 - 活动创建后的初始状态
 *   - 1: 待审核 - 提交审核但尚未通过
 *   - 2: 已发布 - 审核通过并发布（默认值）
 *   - 3: 已取消 - 活动已被取消
 *   - 4: 已结束 - 活动已结束
 * @param {number} categoryId - 活动分类ID
 * @param {string} startTime - 活动开始时间，ISO格式的日期字符串
 * @param {string} endTime - 活动结束时间，ISO格式的日期字符串
 * @param {number} page - 当前页码，默认为1
 * @param {number} pageSize - 每页数量，默认为20
 * @param {string} orderBy - 排序字段，可选值：'startTime'（开始时间）或 'createdAt'（创建时间），默认为'startTime'
 * @param {string} order - 排序方式，可选值：'asc'（升序）或 'desc'（降序），默认为'desc'
 * 
 * 返回数据说明：
 * @returns {Object} 返回的数据结构
 *   - code: 状态码
 *   - message: 响应消息
 *   - data: {
 *       activities: 活动列表数组
 *       pagination: {
 *         current: 当前页码
 *         pageSize: 每页数量
 *         total: 总记录数
 *         totalPages: 总页数
 *       }
 *     }
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = request.nextUrl;
    
    // 修改默认状态逻辑，如果没有传status参数，则不加入过滤条件
    const filters = {
      categoryId: searchParams.has('categoryId') ? parseInt(searchParams.get('categoryId')!, 10) : undefined,
      startTime: searchParams.has('startTime') ? new Date(searchParams.get('startTime')!) : undefined,
      endTime: searchParams.has('endTime') ? new Date(searchParams.get('endTime')!) : undefined
    };

    // 只有当明确指定了status时才添加到过滤条件中
    if (searchParams.has('status')) {
      filters.status = parseInt(searchParams.get('status')!, 10) as ActivityStatusType;
    }

    // 解析分页参数
    const page = searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.has('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 20;

    // 解析排序参数
    const orderBy = (searchParams.get('orderBy') || 'startTime') as 'startTime' | 'createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // 获取活动列表
    const result = await listActivities({
      ...filters,
      page,
      pageSize,
      orderBy,
      order
    });

    const res: APIResponse = {
      code: 200,
      message: '获取活动列表成功',
      data: {
        activities: result.activities,
        pagination: {
          current: page,
          pageSize,
          total: result.pagination.total,
          totalPages: Math.ceil(result.pagination.total / pageSize)
        }
      }
    };
    return NextResponse.json(res);

  } catch (error: any) {
    console.error('获取活动列表失败:', error);
    const res: APIResponse = {
      code: 500,
      message: `获取活动列表失败: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
