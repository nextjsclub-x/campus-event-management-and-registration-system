import { NextResponse } from 'next/server';
import { register } from '@/models/user/register';
import { z } from 'zod';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { UserInfo, UserRegisterRequest } from '@/types/user.type';

// 注册请求体验证schema
const signUpSchema = z.object({
	email: z.string().email('邮箱格式不正确'),
	password: z.string().min(6, '密码至少6位'),
	name: z.string().min(2, '姓名至少2个字符'),
	studentId: z.string().min(5, '学号格式不正确'),
}) satisfies z.ZodType<UserRegisterRequest>;

export async function POST(request: Request) {
	try {
		// 解析请求体
		const body = await request.json();

		// 验证请求参数
		const result = signUpSchema.safeParse(body);
		if (!result.success) {
			// 参数验证失败响应
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: result.error.issues[0].message,
				data: null,
			};
			return NextResponse.json(response, { status: response.code });
		}

		const { email, password, name, studentId } = result.data;

		// 调用注册服务
		const user = await register({ email, password, name, studentId });

		// 注册成功响应
		const response: APIResponse<UserInfo> = {
			code: APIStatusCode.CREATED,
			message: '注册成功',
			data: {
				id: user.id,
				email: user.email,
				name: user.name,
				studentId: user.studentId,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
		};
		return NextResponse.json(response, { status: response.code });
	} catch (error: unknown) {
		// 处理邮箱已存在等冲突错误
		if (error instanceof Error && 'code' in error && error.code === 409) {
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: error.message,
				data: null,
			};
			return NextResponse.json(response, { status: response.code });
		}

		// 处理其他未知服务器错误
		const response: APIResponse = {
			code: APIStatusCode.INTERNAL_ERROR,
			message: '服务器错误',
			data: null,
		};
		return NextResponse.json(response, { status: response.code });
	}
}
