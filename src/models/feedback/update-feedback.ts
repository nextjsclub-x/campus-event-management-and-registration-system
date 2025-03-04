import { and, eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { feedback } from '@/schema/feedback.schema';
import type { NewFeedback } from './utils';

export async function updateFeedback(
	feedbackId: number,
	userId: number,
	updateData: {
		rating?: number;
		comment?: string;
	},
) {
	// 1. 检查反馈是否存在且属于该用户
	const [existingFeedback] = await db
		.select()
		.from(feedback)
		.where(and(eq(feedback.id, feedbackId), eq(feedback.userId, userId)));

	if (!existingFeedback) {
		throw new Error(
			'Feedback not found or you do not have permission to update it',
		);
	}

	// 2. 更新反馈
	const [updatedFeedback] = await db
		.update(feedback)
		.set(updateData)
		.where(eq(feedback.id, feedbackId))
		.returning();

	return updatedFeedback;
}

