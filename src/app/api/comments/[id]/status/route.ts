import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { updateCommentStatus } from '@/models/comment';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import { CommentStatusType } from '@/types/comment.types';

// 更新状态的请求体验证schema
const updateStatusSchema = z.object({
  status: z.nativeEnum(CommentStatusType),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const validatedBody = updateStatusSchema.parse(body);

    const comment = await updateCommentStatus(id, validatedBody.status);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '更新评论状态成功',
      data: comment,
    };
    return Response.json(response);
  } catch (error) {
    console.error('更新评论状态失败:', error);

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
      message: (error as Error).message || '更新评论状态失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
