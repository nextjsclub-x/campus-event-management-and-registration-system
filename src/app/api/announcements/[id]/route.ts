import type { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/models/announcement';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

// 更新公告的请求体验证schema
const updateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题最长100字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  isPublished: z.number().optional(),
});

type UpdateParams = z.infer<typeof updateSchema>;

// 从路由参数中获取ID
function getAnnouncementId(request: NextRequest) {
  const id = request.url.split('/').pop();
  if (!id || Number.isNaN(Number(id))) {
    throw new Error('无效的公告ID');
  }
  return Number(id);
}

export async function GET(request: NextRequest) {
  try {
    const id = getAnnouncementId(request);
    const announcement = await getAnnouncement(id);

    if (!announcement) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '公告不存在',
        data: null,
      };
      return Response.json(response, { status: 404 });
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '获取公告成功',
      data: announcement,
    };
    return Response.json(response);
  } catch (error) {
    console.error('获取公告失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '获取公告失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = getAnnouncementId(request);
    const body = await request.json();
    const validatedBody = updateSchema.parse(body) as UpdateParams;

    const announcement = await updateAnnouncement(id, validatedBody);

    if (!announcement) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '公告不存在',
        data: null,
      };
      return Response.json(response, { status: 404 });
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '更新公告成功',
      data: announcement,
    };
    return Response.json(response);
  } catch (error) {
    console.error('更新公告失败:', error);

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
      message: '更新公告失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = getAnnouncementId(request);
    const result = await deleteAnnouncement(id);

    if (!result) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '公告不存在',
        data: null,
      };
      return Response.json(response, { status: 404 });
    }

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '删除公告成功',
      data: null,
    };
    return Response.json(response);
  } catch (error) {
    console.error('删除公告失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '删除公告失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
