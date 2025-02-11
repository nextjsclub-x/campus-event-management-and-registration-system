import { NextRequest } from 'next/server';
import { getAuthData } from '@/lib/auth/utils';
import { 
  getFeedback, 
  updateFeedback, 
  deleteFeedback 
} from '@/service/feedback.service';

// GET: 获取单个反馈
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = Number(params.id);
    const feedback = await getFeedback(feedbackId);

    return Response.json({
      code: 200,
      message: 'success',
      data: feedback
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}

// PUT: 更新反馈
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await getAuthData();
    
    if (!authData?.id) {
      return Response.json({
        code: 401,
        message: '未登录',
      }, { status: 401 });
    }

    const feedbackId = Number(params.id);
    const body = await request.json();
    const { rating, comment } = body;

    // 参数验证
    if (!rating && !comment) {
      return Response.json({
        code: 400,
        message: '至少需要提供一个更新字段',
      }, { status: 400 });
    }

    // 评分范围验证
    if (rating && (rating < 1 || rating > 5)) {
      return Response.json({
        code: 400,
        message: '评分必须在1-5之间',
      }, { status: 400 });
    }

    const feedback = await updateFeedback(feedbackId, authData.id, {
      rating,
      comment,
    });

    return Response.json({
      code: 200,
      message: '反馈更新成功',
      data: feedback
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}

// DELETE: 删除反馈
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await getAuthData();
    
    if (!authData?.id) {
      return Response.json({
        code: 401,
        message: '未登录',
      }, { status: 401 });
    }

    const feedbackId = Number(params.id);
    await deleteFeedback(feedbackId, authData.id);

    return Response.json({
      code: 200,
      message: '反馈删除成功'
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
} 
