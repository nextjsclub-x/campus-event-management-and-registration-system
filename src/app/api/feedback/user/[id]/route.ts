import { NextRequest } from 'next/server';
import { getUserFeedbacks } from '@/service/feedback.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    const { feedbacks, pagination } = await getUserFeedbacks(userId, page, pageSize);

    return Response.json({
      code: 200,
      message: 'success',
      data: {
        feedbacks,
        total: pagination.total,
        pagination
      }
    });

  } catch (error: any) {
    return Response.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
} 
