import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  registerActivity,
  getUserRegistrations,
  getActivityRegistrations,
} from '@/models/registration';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { PaginationOptions } from '@/types/pagination.types';
import type { 
  Registration, 
  ActivityRegistrationsResponse,
  UserRegistrationsResponse 
} from '@/types/registration.types';
import { z } from 'zod';

// 创建报名请求验证schema
const createRegistrationSchema = z.object({
  activityId: z.number().positive('活动ID必须为正整数'),
  remark: z.string().max(500, '备注不能超过500个字符').optional(),
});

// 查询参数验证schema
const querySchema = z.object({
  activityId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  userId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
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
});

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const response: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 2. 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params);

    // 3. 构建分页选项
    const paginationOptions: PaginationOptions = {
      page: validatedParams.page || 1,
      limit: validatedParams.pageSize || 10,
    };

    // 4. 根据查询参数选择不同的查询方式
    let registrations: ActivityRegistrationsResponse | UserRegistrationsResponse;
    if (validatedParams.activityId) {
      // 检查是否是活动组织者
      registrations = await getActivityRegistrations(
        validatedParams.activityId,
        paginationOptions
      );
    } else {
      // 获取用户自己的报名
      registrations = await getUserRegistrations(
        Number(userId),
        paginationOptions
      );
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取报名列表成功',
      data: registrations,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('获取报名列表失败:', error);

    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '参数验证失败',
        data: error.errors,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取报名列表失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      const response: APIResponse = {
        code: APIStatusCode.UNAUTHORIZED,
        message: '请先登录',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 2. 获取并验证请求数据
    const body = await request.json();
    const result = createRegistrationSchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 创建报名
    const registration = await registerActivity(
      Number(userId),
      result.data.activityId
    );

    const response: APIResponse = {
      code: APIStatusCode.CREATED,
      message: '报名成功',
      data: registration,
    };
    return NextResponse.json(response, { status: response.code });
  } catch (error) {
    console.error('报名失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '报名失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
