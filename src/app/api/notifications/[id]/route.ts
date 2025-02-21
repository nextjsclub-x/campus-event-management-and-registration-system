import type { NextRequest } from 'next/server';
import {
	getNotificationById,
	markNotificationAsRead,
} from '@/models/notification';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const notificationId = Number(params.id);
		if (Number.isNaN(notificationId)) {
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: '无效的通知ID',
				data: null,
			};
			return Response.json(response, { status: 400 });
		}

		const notification = await getNotificationById(notificationId);

		const response: APIResponse = {
			code: APIStatusCode.SUCCESS,
			message: '获取通知成功',
			data: notification,
		};
		return Response.json(response);
	} catch (error) {
		console.error('获取通知失败:', error);

		if (error instanceof Error && error.message === '通知不存在') {
			const response: APIResponse = {
				code: APIStatusCode.NOT_FOUND,
				message: '通知不存在',
				data: null,
			};
			return Response.json(response, { status: 404 });
		}

		const response: APIResponse = {
			code: APIStatusCode.INTERNAL_ERROR,
			message: '获取通知失败',
			data: null,
		};
		return Response.json(response, { status: 500 });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const notificationId = Number(params.id);
		if (Number.isNaN(notificationId)) {
			const response: APIResponse = {
				code: APIStatusCode.BAD_REQUEST,
				message: '无效的通知ID',
				data: null,
			};
			return Response.json(response, { status: 400 });
		}

		await markNotificationAsRead(notificationId);

		const response: APIResponse = {
			code: APIStatusCode.SUCCESS,
			message: '标记通知已读成功',
			data: null,
		};
		return Response.json(response);
	} catch (error) {
		console.error('标记通知已读失败:', error);

		const response: APIResponse = {
			code: APIStatusCode.INTERNAL_ERROR,
			message: '标记通知已读失败',
			data: null,
		};
		return Response.json(response, { status: 500 });
	}
}
