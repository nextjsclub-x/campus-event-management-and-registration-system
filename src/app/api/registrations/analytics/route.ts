import type { NextRequest } from 'next/server';
import { 
  getRegistrationAnalytics,
  getParticipationAnalytics 
} from '@/models/registration';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { 
  RegistrationAnalytics,
  ParticipationAnalytics 
} from '@/types/registration.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  activityId: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .optional(),
  days: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().positive())
    .default('30'), // 默认查询最近30天
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
      return Response.json(response, { status: 401 });
    }

    // 2. 获取并验证查询参数
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const validatedParams = querySchema.parse(params);

    // 3. 获取分析数据
    const activityId = validatedParams.activityId || 0;
    const [registrationStats, participationStats] = await Promise.all([
      getRegistrationAnalytics(activityId),
      activityId ? getParticipationAnalytics(activityId) : null
    ]);

    // 构造返回数据
    const registrationAnalytics: RegistrationAnalytics = {
      activityId: registrationStats.activityId,
      activityTitle: registrationStats.activityTitle,
      capacity: registrationStats.capacity,
      stats: registrationStats.stats,
      rates: {
        approvalRate: 0,
        rejectionRate: 0,
        cancellationRate: 0,
        attendanceRate: Number(registrationStats.rates.attendanceRate.replace('%', '')) / 100
      }
    };

    // 如果有参与度分析数据，也构造相应的数据
    const participationAnalytics = participationStats ? {
      activityId: participationStats.activityId,
      activityTitle: participationStats.activityTitle,
      participantStats: {
        total: participationStats.stats.registered,
        active: participationStats.stats.attended,
        inactive: participationStats.stats.absent
      },
      timeStats: [],
      demographicStats: {}
    } : null;

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取分析数据成功',
      data: {
        registrationAnalytics,
        participationAnalytics
      }
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取报名分析数据失败:', error);

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
      message: '获取报名分析数据失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
