import { type NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
	getActivity,
	updateActivity,
	deleteActivity,
	updateActivityStatus,
} from '@/service/activity.service';
import { ActivityStatus } from '@/types/activity.types';

export const runtime = 'nodejs';

// 获取单个活动详情
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = Number(params.id);
		const activity = await getActivity(id);

		return NextResponse.json({
			code: APIStatusCode.OK,
			message: '获取活动详情成功',
			data: activity,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				code: APIStatusCode.BAD_REQUEST,
				message: error.message || '获取活动详情失败',
				data: null,
			},
			{ status: error.message === '活动不存在' ? 404 : 500 },
		);
	}
}

// 更新活动信息
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = Number(params.id);
		const organizerId = Number(request.headers.get('X-User-Id'));
		const body = await request.json();

		if (!organizerId) {
			return NextResponse.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '未找到组织者信息',
					data: null,
				},
				{ status: 400 },
			);
		}

		const activity = await updateActivity(id, organizerId, body);

		return NextResponse.json({
			code: APIStatusCode.OK,
			message: '更新活动成功',
			data: activity,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				code: APIStatusCode.BAD_REQUEST,
				message: error.message || '更新活动失败',
				data: null,
			},
			{ status: error.message === '活动不存在' ? 404 : 500 },
		);
	}
}

// 更新活动状态
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = Number(params.id);
		const organizerId = Number(request.headers.get('X-User-Id'));
		const { status } = await request.json();

		if (!organizerId) {
			return NextResponse.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '未找到组织者信息',
					data: null,
				},
				{ status: 400 },
			);
		}

		const activity = await updateActivityStatus(id, organizerId, status);

		return NextResponse.json({
			code: APIStatusCode.OK,
			message: '更新活动状态成功',
			data: activity,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				code: APIStatusCode.BAD_REQUEST,
				message: error.message || '更新活动状态失败',
				data: null,
			},
			{ status: error.message === '活动不存在' ? 404 : 500 },
		);
	}
}

// 删除活动
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = Number(params.id);
		const organizerId = Number(request.headers.get('X-User-Id'));

		if (!organizerId) {
			return NextResponse.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '未找到组织者信息',
					data: null,
				},
				{ status: 400 },
			);
		}

		const activity = await deleteActivity(id, organizerId);

		return NextResponse.json({
			code: APIStatusCode.OK,
			message: '删除活动成功',
			data: activity,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				code: APIStatusCode.BAD_REQUEST,
				message: error.message || '删除活动失败',
				data: null,
			},
			{ status: error.message === '活动不存在' ? 404 : 500 },
		);
	}
}
