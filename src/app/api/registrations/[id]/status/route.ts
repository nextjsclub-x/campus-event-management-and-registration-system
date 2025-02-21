import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  approveRegistration,
  rejectRegistration
} from '@/models/registration';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { 
  RegistrationStatus, 
  type RegistrationStatusType,
  type RegistrationStatusUpdateResponse 
} from '@/types/registration.types';
import { z } from 'zod';

// 更新状态请求验证schema
const updateStatusSchema = z.object({
  status: z
    .number()
    .refine(
      (val): val is RegistrationStatusType =>
        Object.values(RegistrationStatus).includes(val as RegistrationStatusType),
      { message: '无效的报名状态' }
    ),
  reason: z.string().max(500, '理由不能超过500个字符').optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 2. 验证报名ID
    const registrationId = Number.parseInt(params.id, 10);
    if (Number.isNaN(registrationId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的报名ID',
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 3. 获取并验证请求数据
    const body = await request.json();
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: result.error.issues[0].message,
        data: null,
      };
      return NextResponse.json(response, { status: response.code });
    }

    // 4. 根据状态选择不同的操作
    let registration: RegistrationStatusUpdateResponse;
    const { status, reason } = result.data;

    switch (status) {
      case RegistrationStatus.APPROVED:
        registration = await approveRegistration(registrationId);
        break;
      case RegistrationStatus.REJECTED:
        registration = await rejectRegistration(registrationId);
        break;
      default:
        throw new Error('不支持的状态更新操作');
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '更新报名状态成功',
      data: registration,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('更新报名状态失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '更新报名状态失败',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
} 
