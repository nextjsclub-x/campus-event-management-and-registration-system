import { type NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getRegistrations } from '@/service/registration.service';
import type { RegistrationStatus } from '@/types/registration.types';
import { getActivity } from '@/service/activity.service';

export const runtime = 'nodejs';

// 获取活动的报名列表
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const activityId = Number(params.id);
		const organizerId = Number(request.headers.get('X-User-Id'));
		const { searchParams } = new URL(request.url);
		const rawStatus = searchParams.get('status');
		const status = rawStatus
			? (Number(
					rawStatus,
				) as (typeof RegistrationStatus)[keyof typeof RegistrationStatus])
			: undefined;

		if (!organizerId) {
			return NextResponse.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '未找到用户信息',
					data: null,
				},
				{ status: 400 },
			);
		}

		// 验证是否为活动组织者
		const activity = await getActivity(activityId);
		if (activity.organizerId !== organizerId) {
			return NextResponse.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '无权限查看此活动的报名列表',
					data: null,
				},
				{ status: 403 },
			);
		}

		const result = await getRegistrations(activityId, status);

		return NextResponse.json({
			code: APIStatusCode.OK,
			message: '获取活动报名列表成功',
			data: result,
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				code: APIStatusCode.BAD_REQUEST,
				message: error.message || '获取活动报名列表失败',
				data: null,
			},
			{ status: 500 },
		);
	}
}
