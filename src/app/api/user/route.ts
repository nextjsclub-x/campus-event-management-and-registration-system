import type { NextRequest } from 'next/server';
import { getUsers } from '@/models/user/get-users';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
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
		// 获取并验证查询参数
		const { searchParams } = request.nextUrl;
		const params = Object.fromEntries(searchParams.entries());
		const validatedParams = querySchema.parse(params);

		// 获取用户列表
		const result = await getUsers({
			page: validatedParams.page || 1,
			limit: validatedParams.pageSize || 10,
		});

		const response: APIResponse = {
			code: APIStatusCode.SUCCESS,
			message: '获取用户列表成功',
			data: {
				users: result.items.map((user) => ({
					...user,
					activityCount: 0, // TODO: 这里需要实现获取用户参与的活动数量
				})),
				pagination: {
					current: result.currentPage,
					pageSize: result.limit,
					total: result.total,
					totalPages: result.totalPages,
				},
			},
		};

		return Response.json(response);
	} catch (error) {
		console.error('获取用户列表失败:', error);

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
			message: '获取用户列表失败',
			data: null,
		};
		return Response.json(response, { status: 500 });
	}
}
