import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { list, create, updateStatus, remove as deleteComment } from '@/service/comment.service';

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const status = searchParams.get('status')
      ? Number(searchParams.get('status')) 
      : undefined;
    const userId = Number(searchParams.get('userId'));

    // 从请求头获取当前用户ID
    const currentUserId = Number(request.headers.get('X-User-Id'));

    if (!currentUserId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到用户信息',
        data: null
      }, { status: 400 });
    }

    const result = await list({
      status,
      userId
    }, {
      page,
      pageSize
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取评论列表成功',
      data: result
    });
  } catch (error: any) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: error.message || '获取评论列表失败',
      data: null
    }, { status: 400 });
  }
}

// 创建新评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;
    
    // 从请求头获取用户ID
    const userId = Number(request.headers.get('X-User-Id'));
    
    if (!userId) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '未找到用户信息',
        data: null
      }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '标题和内容不能为空',
        data: null
      }, { status: 400 });
    }

    const comment = await create({
      userId,
      title,
      content,
      status: 0, // 默认待审核状态
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '创建评论成功',
      data: comment
    });
  } catch (error: any) {
    console.error('创建评论失败:', error);
    return NextResponse.json({
      code: APIStatusCode.BAD_REQUEST,
      message: `创建评论失败: ${error.message || '未知错误'}`,
      data: null
    }, { status: 400 });
  }
}

// 更新评论状态
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof status === 'undefined') {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '评论ID和状态不能为空',
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
    }, { status: 400 });
  }
}

// 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({
        code: APIStatusCode.BAD_REQUEST,
        message: '评论ID不能为空',
        data: null
      }, { status: 400 });
    }

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
    }, { status: 400 });
  }
} 
