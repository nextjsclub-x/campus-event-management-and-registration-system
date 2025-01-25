import { NextRequest, NextResponse } from 'next/server';
import { createActivity, listActivities, ActivityStatus, ActivityStatusType } from '@/models/activity.model';
import { getApprovedRegistrationCount } from '@/models/registration.model';
import { APIStatusCode, APIJsonResponse } from '@/schema/api-response.schema';

export const runtime = 'nodejs';

function parseActivityStatus(input: string | null): ActivityStatusType | undefined {
  if (!input) return undefined;
  const parsed = parseInt(input, 10);

  // 检查是否为有效的数字
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  // 声明成 number[] (或 readonly number[]) 
  const validStatuses = [
    ActivityStatus.DELETED,
    ActivityStatus.DRAFT,
    ActivityStatus.PUBLISHED,
    ActivityStatus.CANCELLED,
    ActivityStatus.COMPLETED
  ] as number[];

  // 用普通 number[] 去 includes(parsed) 就不会报类型错误
  if (validStatuses.includes(parsed)) {
    // 这里再断言成 ActivityStatusType
    return parsed as ActivityStatusType;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 1. 解析 statusParam，然后用 parseActivityStatus
    const statusParam = searchParams.get('status');
    const status = parseActivityStatus(statusParam);

    // 如果用户传了一个 statusParam，但 parseActivityStatus 返回 undefined，就表示无效
    if (statusParam !== null && status === undefined) {
      const errRes: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的活动状态值',
        data: null
      };
      return NextResponse.json(errRes);
    }

    // 2. 解析 categoryId
    const categoryIdParam = searchParams.get('categoryId');
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
    if (categoryIdParam !== null && (categoryId === undefined || Number.isNaN(categoryId) || categoryId < 0)) {
      const errRes: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的分类ID',
        data: null
      };
      return NextResponse.json(errRes);
    }

    // 3. 解析时间
    const startTimeParam = searchParams.get('startTime');
    const endTimeParam = searchParams.get('endTime');
    const startTime = startTimeParam ? new Date(startTimeParam) : undefined;
    const endTime = endTimeParam ? new Date(endTimeParam) : undefined;

    // 4. 解析分页 & 排序
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const orderByParam = searchParams.get('orderBy');
    const orderParam = searchParams.get('order');

    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    const pageSize = pageSizeParam ? Math.min(100, Math.max(1, parseInt(pageSizeParam, 10))) : 20;
    const orderBy = (orderByParam || 'startTime') as 'startTime' | 'createdAt';
    const order = (orderParam || 'desc') as 'asc' | 'desc';

    // 5. 获取活动列表
    const result = await listActivities({
      status,
      categoryId,
      startTime,
      endTime,
      page,
      pageSize,
      orderBy,
      order
    });

    // 6. 获取每个活动的报名人数
    const activitiesWithRegistrations = await Promise.all(
      result.activities.map(async (activity) => {
        const approvedCount = await getApprovedRegistrationCount(activity.id);
        return {
          ...activity,
          currentRegistrations: approvedCount
        };
      })
    );

    // 7. 返回响应
    const res: APIJsonResponse = {
      code: APIStatusCode.OK,
      message: '获取活动列表成功',
      data: {
        ...result,
        activities: activitiesWithRegistrations
      }
    };
    return NextResponse.json(res);

  } catch (error: any) {
    const errRes: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `获取活动列表时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(errRes);
  }
}


export async function POST(request: NextRequest) {
  try {
    const { title, description, categoryId, location, startTime, endTime, capacity } = await request.json();

    // 参数验证
    if (!title || !description || !categoryId || !location || !startTime || !endTime || !capacity) {
      const res: APIJsonResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '请提供所有必需的活动信息',
        data: null
      };
      return NextResponse.json(res);
    }

    // 从请求头获取用户ID
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const res: APIJsonResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null
      };
      return NextResponse.json(res);
    }

    // 调用model层方法创建活动
    const activity = await createActivity(parseInt(userId, 10), {
      title,
      description,
      categoryId,
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity
    });

    const res: APIJsonResponse = {
      code: APIStatusCode.CREATED,
      message: '活动创建成功',
      data: activity
    };
    return NextResponse.json(res);
  } catch (error: any) {
    // 处理未预期的错误
    const res: APIJsonResponse = {
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: `创建活动时发生错误: ${error.message}`,
      data: null
    };
    return NextResponse.json(res);
  }
}
