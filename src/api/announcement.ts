import { get, post, put, del, patch } from '@/utils/request';
import type {
  Announcement,
  AnnouncementQueryParams,
  CreateAnnouncementParams,
  UpdateAnnouncementParams,
  PaginatedAnnouncements
} from '@/types/announcement.types';

/**
 * 获取公告列表
 * @param params 查询参数
 */
export const getAnnouncements = (params?: AnnouncementQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.isPublished !== undefined) {
    searchParams.append('isPublished', params.isPublished.toString());
  }
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  return get<PaginatedAnnouncements>(`/api/announcements?${searchParams.toString()}`);
};

/**
 * 获取公告详情
 * @param id 公告ID
 */
export const getAnnouncement = (id: number) => 
  get<Announcement>(`/api/announcements/${id}`);

/**
 * 创建新公告
 * @param data 公告数据
 */
export const createAnnouncement = (data: CreateAnnouncementParams) => 
  post<Announcement>('/api/announcements', data);

/**
 * 更新公告
 * @param id 公告ID
 * @param data 更新数据
 */
export const updateAnnouncement = (id: number, data: UpdateAnnouncementParams) => 
  put<Announcement>(`/api/announcements/${id}`, data);

/**
 * 删除公告
 * @param id 公告ID
 */
export const deleteAnnouncement = (id: number) => 
  del<{ message: string }>(`/api/announcements/${id}`);

/**
 * 切换公告发布状态
 * @param id 公告ID
 */
export const toggleAnnouncementPublishStatus = (id: number) => 
  patch<Announcement>(`/api/announcements/${id}/publish`);

/**
 * 使用示例：
 * ```typescript
 * // 获取公告列表
 * const response = await getAnnouncements({
 *   isPublished: true,
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * // 获取单个公告
 * const announcement = await getAnnouncement(1);
 * 
 * // 创建新公告
 * const createResponse = await createAnnouncement({
 *   title: '新公告',
 *   content: '公告内容',
 *   isPublished: 1
 * });
 * 
 * // 更新公告
 * const updateResponse = await updateAnnouncement(1, {
 *   title: '更新后的标题'
 * });
 * 
 * // 删除公告
 * const deleteResponse = await deleteAnnouncement(1);
 * 
 * // 切换公告发布状态
 * const toggleResponse = await toggleAnnouncementPublishStatus(1);
 * ```
 */ 
