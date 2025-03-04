'use server';

import { getUserById } from '@/models/user/get-user-by-id';
import { getActivity } from './get-activity';

export async function checkActivityPermission(
	userId: number,
	activityId: number,
) {
	const activity = await getActivity(activityId);
	const user = await getUserById(userId);

	if (activity.organizerId === userId) {
		return {
			hasPermission: true,
			reason: '作为活动创建者，您可以审核报名',
		};
	}

	if (user.role === 'admin') {
		return {
			hasPermission: true,
			reason: '作为管理员，您可以审核报名',
		};
	}

	if (user.role === 'teacher') {
		return {
			hasPermission: true,
			reason: '作为教师，您可以审核报名',
		};
	}

	return {
		hasPermission: false,
		reason: '',
	};
}

