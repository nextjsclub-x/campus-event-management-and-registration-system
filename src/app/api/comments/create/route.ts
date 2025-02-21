import type { NextRequest } from 'next/server';
import { createComment } from '@/models/comment/create-comment';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { Comment, NewComment } from '@/schema/comment.schema';
import { CommentStatusType } from '@/types/comment.types';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// 验证必填字段
		if (!body.userId || !body.title || !body.content) {
			return Response.json(
				{
					code: APIStatusCode.BAD_REQUEST,
					message: '缺少必要字段',
					data: null,
				} satisfies APIResponse,
				{ status: 400 },
			);
		}

		// 构建评论数据
		const newComment: NewComment = {
			userId: body.userId,
			title: body.title,
			content: body.content,
			status: CommentStatusType.PENDING, // 新创建的评论默认为待审核状态
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// 创建评论
		const comment = await createComment(newComment);

		return Response.json(
			{
				code: APIStatusCode.CREATED,
				message: '评论创建成功',
				data: comment,
			} satisfies APIResponse<Comment>,
			{ status: 201 },
		);
	} catch (error) {
		console.error('创建评论失败:', error);
		return Response.json(
			{
				code: APIStatusCode.INTERNAL_ERROR,
				message: '创建评论失败',
				data: null,
			} satisfies APIResponse,
			{ status: 500 },
		);
	}
}
