'use server'

import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getById, updateStatus, remove as deleteComment } from '@/service/comment.service';


// 获取单个评论详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const comment = await getById(id);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取评论详情成功',
      data: comment
    });
  } catch (error: any) {
    console.error('获取评论详情失败:', error);
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '获取评论详情失败',
      data: null
    }, { status: 500 });
  }
}

// 更新评论状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const { status } = await request.json();

    if (typeof status === 'undefined') {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '状态不能为空',
        data: null
      }, { status: 400 });
    }

    const comment = await updateStatus(id, status);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '更新评论状态成功',
      data: comment
    });
  } catch (error: any) {
    console.error('更新评论状态失败:', error);
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '更新评论状态失败',
      data: null
    }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await deleteComment(id);

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '删除评论成功',
      data: result
    });
  } catch (error: any) {
    console.error('删除评论失败:', error);
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '删除评论失败',
      data: null
    }, { status: 500 });
  }
} 
