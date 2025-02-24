import type { NextRequest } from 'next/server';
import { getActivitiesByOrganizer } from '@/models/activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { ActivityStatus, type ActivityStatusType } from '@/types/activity.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  status: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(
      z
        .number()
        .refine(
          (val): val is ActivityStatusType =>
            Object.values(ActivityStatus).includes(val as ActivityStatusType),
          { message: '无效的活动状态' },
        ),
    )
    .optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  pageSize: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive().max(100))
    .optional(),
  orderBy: z.enum(['startTime', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const userId = request.headers.get('x-user-id');
    // if (!userId) {
    //   const response: APIResponse = {
    //     code: APIStatusCode.UNAUTHORIZED,
    //     message: '请先登录',
    //     data: null,
    //   };
    //   return Response.json(response, { status: 401 });
    // }

    // 2. 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params);

    // 3. 转换日期字符串为Date对象
    const filters = {
      ...validatedParams,
      startTime: validatedParams.startTime ? new Date(validatedParams.startTime) : undefined,
      endTime: validatedParams.endTime ? new Date(validatedParams.endTime) : undefined,
    };

    // 4. 获取用户的活动列表
    const activities = await getActivitiesByOrganizer(Number(userId));

    // 5. 根据筛选条件过滤
    let filteredActivities = activities;
    
    // 5.1 状态筛选
    if (filters.status !== undefined) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.status === filters.status
      );
    }

    // 5.2 时间筛选
    const startTimeDate = filters.startTime;
    if (startTimeDate) {
      filteredActivities = filteredActivities.filter(
        (activity) => new Date(activity.startTime) >= startTimeDate
      );
    }
    const endTimeDate = filters.endTime;
    if (endTimeDate) {
      filteredActivities = filteredActivities.filter(
        (activity) => new Date(activity.endTime) <= endTimeDate
      );
    }

    // 5.3 排序
    if (filters.orderBy) {
      filteredActivities.sort((a, b) => {
        const aValue = filters.orderBy === 'startTime' ? a.startTime : a.createdAt;
        const bValue = filters.orderBy === 'startTime' ? b.startTime : b.createdAt;
        return filters.order === 'desc'
          ? new Date(bValue).getTime() - new Date(aValue).getTime()
          : new Date(aValue).getTime() - new Date(bValue).getTime();
      });
    }

    // 5.4 分页
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedActivities = filteredActivities.slice(start, end);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取个人活动列表成功',
      data: {
        activities: paginatedActivities,
        pagination: {
          current: page,
          pageSize,
          total: filteredActivities.length,
          totalPages: Math.ceil(filteredActivities.length / pageSize),
        },
      },
    };

    return Response.json(response);
  } catch (error) {
    console.error('获取个人活动列表失败:', error);

    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '参数验证失败',
        data: error.errors,
      };
      return Response.json(response, { status: 400 });
    }

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取个人活动列表失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
