import type { NextRequest } from 'next/server';
import { listActivities } from '@/models/activity/list-activities';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import {
	ActivityStatus,
	type ActivityStatusType,
} from '@/types/activity.types';
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
	categoryId: z
		.string()
		.transform((val) => Number.parseInt(val, 10))
		.pipe(z.number().positive())
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

type QueryParams = z.infer<typeof querySchema>;

export async function GET(request: NextRequest) {
	try {
		// 获取并验证查询参数
		const {searchParams} = request.nextUrl;
		const params = Object.fromEntries(searchParams.entries());
		const validatedParams = querySchema.parse(params) as QueryParams;

		// 转换日期字符串为Date对象
		const filters = {
			...validatedParams,
			startTime: validatedParams.startTime ? new Date(validatedParams.startTime) : undefined,
			endTime: validatedParams.endTime ? new Date(validatedParams.endTime) : undefined,
		};

		// 获取活动列表
		const activities = await listActivities(filters);

		return new Response(JSON.stringify({
			code: APIStatusCode.SUCCESS,
			message: '获取活动列表成功',
			data: activities,
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0',
			},
		});
	} catch (error) {
		console.error('获取活动列表失败:', error);

		if (error instanceof z.ZodError) {
			return Response.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '参数验证失败',
					data: error.errors,
				},
				{ 
					status: 400,
					headers: {
						'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
						'Pragma': 'no-cache',
						'Expires': '0',
					},
				},
			);
		}

		return Response.json(
			{
				code: APIStatusCode.INTERNAL_ERROR,
				message: '获取活动列表失败',
				data: null,
			},
			{ 
				status: 500,
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0',
				},
			},
		);
	}
}
