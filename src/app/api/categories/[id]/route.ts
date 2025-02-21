import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkCategoryExists, updateCategory } from '@/models/category';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { CategoryStatus } from '@/types/category.types';
import { z } from 'zod';

// 更新分类请求验证schema
const updateCategorySchema = z.object({
	name: z
		.string()
		.min(1, '分类名称不能为空')
		.max(50, '分类名称不能超过50个字符')
		.optional(),
	description: z.string().max(500, '分类描述不能超过500个字符').optional(),
	status: z
		.number()
		.refine((val) => Object.values(CategoryStatus).includes(val), {
			message: '无效的分类状态',
		})
		.optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const categoryId = Number.parseInt(params.id, 10);
		if (Number.isNaN(categoryId)) {
			return Response.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '无效的分类ID',
					data: null,
				},
				{ status: 400 },
			);
		}

		const category = await checkCategoryExists(categoryId);

		return Response.json({
			code: APIStatusCode.SUCCESS,
			message: '获取分类详情成功',
			data: category,
		});
	} catch (error) {
		console.error('获取分类详情失败:', error);

		return Response.json(
			{
				code: APIStatusCode.INTERNAL_ERROR,
				message: '获取分类详情失败',
				data: null,
			},
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
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

		// 2. 验证分类ID
		const categoryId = Number.parseInt(params.id, 10);
		if (Number.isNaN(categoryId)) {
			return Response.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '无效的分类ID',
					data: null,
				},
				{ status: 400 },
			);
		}

		// 3. 获取并验证请求数据
		const body = await request.json();
		const result = updateCategorySchema.safeParse(body);
		if (!result.success) {
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: result.error.issues[0].message,
				data: null,
			};
			return NextResponse.json(response, { status: response.code });
		}

		// 4. 更新分类
		const category = await updateCategory(categoryId, result.data);

		// 5. 返回成功响应
		const response: APIResponse = {
			code: APIStatusCode.SUCCESS,
			message: '分类更新成功',
			data: category,
		};
		return NextResponse.json(response, { status: response.code });
	} catch (error) {
		console.error('更新分类失败:', error);

		// 处理其他错误
		const response: APIResponse = {
			code: APIStatusCode.INTERNAL_ERROR,
			message: '更新分类失败',
			data: null,
		};
		return NextResponse.json(response, { status: response.code });
	}
}
