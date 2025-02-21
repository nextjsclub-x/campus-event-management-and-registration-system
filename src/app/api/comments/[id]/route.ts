import type { NextRequest } from 'next/server';
import { getCommentById, deleteComment } from '@/models/comment';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const comment = await getCommentById(id);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取评论成功',
      data: comment,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取评论失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: (error as Error).message || '获取评论失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await deleteComment(id);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: result.message,
      data: null,
    };
    return Response.json(response);
  } catch (error) {
    console.error('删除评论失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: (error as Error).message || '删除评论失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
