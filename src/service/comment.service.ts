'use server';

import {
	createComment,
	getComments,
	getCommentById,
	updateCommentStatus,
	deleteComment,
	CommentStatus,
	type CommentStatusType,
} from '@/models/comment.model';
import type { NewComment } from '@/schema/comment.schema';

/**
 * 创建评论
 * @param data - 评论数据
 */
export async function create(data: NewComment) {
	return createComment(data);
}

/**
 * 获取评论列表
 * @param filters - 过滤条件
 * @param pagination - 分页参数
 */
export async function list(
	filters: { status?: number; userId?: number } = {},
	pagination = {},
) {
	const { status, ...otherFilters } = filters;
	return getComments(
		{
			...(status !== undefined ? { status: status as CommentStatusType } : {}),
			...otherFilters,
		},
		pagination,
	);
}

/**
 * 获取评论详情
 * @param id - 评论ID
 */
export async function getById(id: number) {
	return getCommentById(id);
}

/**
 * 更新评论状态
 * @param id - 评论ID
 * @param status - 新状态
 */
export async function updateStatus(id: number, status: number) {
	return updateCommentStatus(id, status as CommentStatusType);
}

/**
 * 删除评论
 * @param id - 评论ID
 */
export async function remove(id: number) {
	return deleteComment(id);
}

/**
 * 获取用户的评论列表
 * @param userId - 用户ID
 * @param pagination - 分页参数
 */
export async function getUserComments(userId: number, pagination = {}) {
	return getComments({ userId }, pagination);
}

/**
 * 获取待审核的评论列表
 * @param pagination - 分页参数
 */
export async function getPendingComments(pagination = {}) {
	return getComments({ status: CommentStatus.PENDING }, pagination);
}
