import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createActivity } from '@/models/activity/create-activity';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { z } from 'zod';

// 创建活动请求验证schema
const createActivitySchema = z
	.object({
		title: z.string().min(1, '标题不能为空').max(255, '标题不能超过255个字符'),
		description: z.string().min(1, '描述不能为空'),
		startTime: z.string().datetime('开始时间格式不正确'),
		endTime: z.string().datetime('结束时间格式不正确'),
		location: z
			.string()
			.min(1, '地点不能为空')
			.max(255, '地点不能超过255个字符'),
		capacity: z.number().int().positive('容量必须为正整数'),
		categoryId: z.number().int().positive('类别ID必须为正整数'),
	})
	.refine((data) => new Date(data.startTime) < new Date(data.endTime), {
		message: '开始时间必须早于结束时间',
		path: ['startTime'],
	})
	.refine((data) => new Date(data.startTime) > new Date(), {
		message: '开始时间必须晚于当前时间',
		path: ['startTime'],
	});

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
		const result = createActivitySchema.safeParse(body);
		if (!result.success) {
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: result.error.issues[0].message,
				data: null,
			};
			return NextResponse.json(response, { status: response.code });
		}

		// 3. 创建活动
		const activity = await createActivity(Number(userId), {
			...result.data,
			startTime: new Date(result.data.startTime),
			endTime: new Date(result.data.endTime),
		});

		// 4. 返回成功响应
		const response: APIResponse = {
			code: APIStatusCode.CREATED,
			message: '活动创建成功，等待审核',
			data: activity,
		};
		return NextResponse.json(response, { status: response.code });
	} catch (error) {
		console.error('创建活动失败:', error);

		// 处理其他错误
		const response: APIResponse = {
			code: APIStatusCode.INTERNAL_ERROR,
			message: '创建活动失败',
			data: null,
		};
		return NextResponse.json(response, { status: response.code });
	}
}
