import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getActivity } from '@/models/activity';
import { getActivityRegistrations } from '@/models/registration/get-activity-registrations';
import { registerActivity } from '@/models/registration/register-activity';
import { cancelRegistration } from '@/models/registration/cancel-registration';
import { approveRegistration } from '@/models/registration/approve-registration';
import { rejectRegistration } from '@/models/registration/reject-registration';
import { revalidatePath } from 'next/cache';
import { getUserById } from '@/models/user/get-user-by-id';
import { checkActivityPermission } from '@/models/activity/check-activity-permission';
import { ActivityClient } from './client';

interface PageProps {
	params: { id: string };
}

// 报名操作的server action
async function handleRegister(activityId: number) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		throw new Error('请先登录');
	}

	await registerActivity(Number(userId), activityId);
	revalidatePath(`/activities/${activityId}`);
}

// 取消报名的server action
async function handleCancel(activityId: number) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		throw new Error('请先登录');
	}

	await cancelRegistration(Number(userId), activityId);
	revalidatePath(`/activities/${activityId}`);
}

// 审核通过的server action
async function handleApprove(registrationId: number, activityId: number) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		throw new Error('请先登录');
	}

	// 检查权限
	const permissionInfo = await checkActivityPermission(
		Number(userId),
		activityId,
	);
	if (!permissionInfo.hasPermission) {
		throw new Error('您没有权限进行此操作');
	}

	await approveRegistration(registrationId);
	revalidatePath(`/activities/${activityId}`);
}

// 审核拒绝的server action
async function handleReject(registrationId: number, activityId: number) {
	'use server';

	const headersList = headers();
	const userId = headersList.get('x-user-id');

	if (!userId) {
		throw new Error('请先登录');
	}

	// 检查权限
	const permissionInfo = await checkActivityPermission(
		Number(userId),
		activityId,
	);
	if (!permissionInfo.hasPermission) {
		throw new Error('您没有权限进行此操作');
	}

	await rejectRegistration(registrationId);
	revalidatePath(`/activities/${activityId}`);
}

// 获取用户信息的server action
async function handleGetUser(userId: number) {
	'use server';

	return getUserById(userId);
}

export default async function ActivityPage({ params }: PageProps) {
	const activityId = Number(params.id);
	const headersList = headers();
	const userId = headersList.get('x-user-id');

	try {
		// 获取活动详情
		const activity = await getActivity(activityId);

		// 获取组织者信息
		const organizer = await getUserById(activity.organizerId);

		// 获取报名列表
		const { registrations } = await getActivityRegistrations(activityId, {
			page: 1,
			pageSize: 100,
		});

		// 获取当前用户信息和权限
		const currentUser = userId ? await getUserById(Number(userId)) : null;
		const permissionInfo = userId
			? await checkActivityPermission(Number(userId), activityId)
			: null;

		return (
  <ActivityClient
    activity={activity}
    activityId={activityId}
    organizer={organizer}
    registrations={registrations}
    currentUserId={userId ? Number(userId) : null}
    currentUser={currentUser}
    permissionInfo={permissionInfo}
    onRegister={handleRegister}
    onCancel={handleCancel}
    onApprove={handleApprove}
    onReject={handleReject}
    onGetUser={handleGetUser}
			/>
		);
	} catch (error) {
		return notFound();
	}
}
