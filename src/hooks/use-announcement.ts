import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPublishStatus,
} from '@/api/announcement';
import { useToast } from '@/hooks/use-toast';
import type { AnnouncementQueryParams, CreateAnnouncementParams, UpdateAnnouncementParams } from '@/types/announcement.types';

/**
 * 获取公告列表的hook
 */
export function useAnnouncementList(params?: AnnouncementQueryParams) {
  return useQuery({
    queryKey: ['announcements', params?.isPublished, params?.page, params?.pageSize],
    queryFn: () => getAnnouncements(params),
    retry: false,
    gcTime: 0, // 不缓存数据
    refetchOnMount: true, // 组件挂载时重新请求
    refetchOnWindowFocus: true, // 窗口聚焦时重新请求
  });
}

/**
 * 获取单个公告详情的hook
 */
export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: () => getAnnouncement(id),
    enabled: !!id,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 创建公告的hook
 */
export function useCreateAnnouncement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementParams) => createAnnouncement(data),
    onSuccess: (response) => {
      if (response.code === 201) {
        toast({
          title: '公告创建成功',
          variant: 'default',
        });
        // 创建成功后，使公告列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '公告创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 更新公告的hook
 */
export function useUpdateAnnouncement(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAnnouncementParams) => updateAnnouncement(id, data),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '公告更新成功',
          variant: 'default',
        });
        // 更新成功后，使公告列表和详情缓存失效
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        queryClient.invalidateQueries({ queryKey: ['announcement', id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '公告更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 删除公告的hook
 */
export function useDeleteAnnouncement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '公告删除成功',
          variant: 'default',
        });
        // 删除成功后，使公告列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '公告删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 切换公告发布状态的hook
 */
export function useToggleAnnouncementPublishStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAnnouncementPublishStatus,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '公告状态切换成功',
          variant: 'default',
        });
        // 切换成功后，使公告列表和详情缓存失效
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        queryClient.invalidateQueries({ 
          queryKey: ['announcement', response.data?.id],
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '公告状态切换失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 使用示例：
 * ```typescript
 * function AnnouncementList() {
 *   const [page, setPage] = useState(1);
 *   const [isPublished, setIsPublished] = useState<boolean>();
 * 
 *   const { data, isLoading } = useAnnouncementList({
 *     isPublished,
 *     page,
 *     pageSize: 10
 *   });
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>公告列表</h1>
 *       {data?.data.announcements.map(announcement => (
 *         <AnnouncementItem
 *           key={announcement.id}
 *           announcement={announcement}
 *         />
 *       ))}
 *       <Pagination
 *         currentPage={page}
 *         totalPages={data?.data.pagination.totalPages || 1}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * 
 * function AnnouncementItem({ announcement }) {
 *   const { mutate: togglePublish } = useToggleAnnouncementPublishStatus();
 *   const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
 * 
 *   return (
 *     <div>
 *       <h2>{announcement.title}</h2>
 *       <p>{announcement.content}</p>
 *       <button onClick={() => togglePublish(announcement.id)}>
 *         {announcement.isPublished ? '取消发布' : '发布'}
 *       </button>
 *       <button onClick={() => deleteAnnouncement(announcement.id)}>
 *         删除
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */ 
