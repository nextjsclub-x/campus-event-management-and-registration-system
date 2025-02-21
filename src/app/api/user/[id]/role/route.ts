import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { updateUser } from '@/models/user/update-user';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { userRoleEnum } from '@/schema/user.schema';

// 请求体验证schema
const updateRoleSchema = z.object({
	role: z.enum(['student', 'teacher', 'admin']),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = Number(params.id);
		const body = await request.json();
		const validatedBody = updateRoleSchema.parse(body);

		const updatedUser = await updateUser(id, {
			role: validatedBody.role,
		});

		const response: APIResponse = {
			code: APIStatusCode.SUCCESS,
			message: '更新用户角色成功',
			data: updatedUser,
		};
		return Response.json(response);
	} catch (error) {
		console.error('更新用户角色失败:', error);

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
			message: '更新用户角色失败',
			data: null,
		};
		return Response.json(response, { status: 500 });
	}
}
