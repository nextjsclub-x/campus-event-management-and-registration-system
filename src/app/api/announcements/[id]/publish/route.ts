import type { NextRequest } from 'next/server';
import { getAnnouncement, toggleAnnouncementPublishStatus } from '@/models/announcement';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';

// 从路由参数中获取ID
function getAnnouncementId(request: NextRequest) {
  const id = request.url.split('/').slice(-2)[0];
  if (!id || Number.isNaN(Number(id))) {
    throw new Error('无效的公告ID');
  }
  return Number(id);
}

export async function PATCH(request: NextRequest) {
  try {
    const id = getAnnouncementId(request);
    
    // 先获取当前公告状态
    const currentAnnouncement = await getAnnouncement(id);
    if (!currentAnnouncement) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '公告不存在',
        data: null,
      };
      return Response.json(response, { status: 404 });
    }

    // 切换状态
    const newStatus = currentAnnouncement.isPublished === 1 ? 0 : 1;
    const announcement = await toggleAnnouncementPublishStatus(id, newStatus);

    const response: APIResponse = {
      code: APIStatusCode.SUCCESS,
      message: '切换公告发布状态成功',
      data: announcement,
    };
    return Response.json(response);
  } catch (error) {
    console.error('切换公告发布状态失败:', error);

    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '切换公告发布状态失败',
      data: null,
    };
    return Response.json(response, { status: 500 });
  }
} 
