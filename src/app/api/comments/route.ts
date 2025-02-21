import type { NextRequest } from 'next/server';
import { getComments } from '@/models/comment/get-comments';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { Comment } from '@/schema/comment.schema';
import type { CommentStatusType, CommentListResponse } from '@/types/comment.types';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
		const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10)));
		const sortBy = searchParams.get('sortBy') || 'createdAt';
		const order = searchParams.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc';
		const statusParam = searchParams.get('status');
		const status = statusParam !== null
			? (Number.parseInt(statusParam, 10) as CommentStatusType)
			: undefined;
		const userIdParam = searchParams.get('userId');
		const userId = userIdParam !== null
			? Number.parseInt(userIdParam, 10)
			: undefined;

		const result = await getComments(
			{ status, userId },
			{ page, limit, sortBy, order }
		);

		return Response.json({
			code: APIStatusCode.SUCCESS,
			message: '获取评论列表成功',
			data: result
		} satisfies APIResponse<CommentListResponse>);
	} catch (error) {
		console.error('获取评论列表失败:', error);
		return Response.json({
			code: APIStatusCode.INTERNAL_ERROR,
			message: '获取评论列表失败',
			data: null
		} satisfies APIResponse, { status: 500 });
	}
}
