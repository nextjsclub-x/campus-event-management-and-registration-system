import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserNotifications,
  getNotification,
  markNotificationAsRead,
  createNotification,
} from '@/api/notification';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/schema/notification.schema';

/**
 * 获取用户通知列表的hook
 */
export function useNotificationList(params?: {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['notifications', params?.isRead, params?.page, params?.pageSize],
    queryFn: () => getUserNotifications(params),
    retry: false,
    gcTime: 0, // 不缓存数据
    refetchOnMount: true, // 组件挂载时重新请求
    refetchOnWindowFocus: true, // 窗口聚焦时重新请求
  });
}

/**
 * 获取单个通知详情的hook
 */
export function useNotification(id: number) {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => getNotification(id),
    enabled: !!id,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 标记通知为已读的hook
 */
export function useMarkNotificationAsRead() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '通知已标记为已读',
          variant: 'default',
        });
        // 标记成功后，使通知列表和详情缓存失效
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '标记已读失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 创建通知的hook
 */
export function useCreateNotification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotification,
    onSuccess: (response) => {
      if (response.code === 201) {
        toast({
          title: '通知创建成功',
          variant: 'default',
        });
        // 创建成功后，使通知列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '通知创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 使用示例：
 * ```typescript
 * function NotificationList() {
 *   const [page, setPage] = useState(1);
 *   const [isRead, setIsRead] = useState<boolean>();
 * 
 *   const { data, isLoading } = useNotificationList({
 *     isRead,
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
 *       <h1>通知列表</h1>
 *       {data?.data.notifications.map(notification => (
 *         <NotificationItem
 *           key={notification.id}
 *           notification={notification}
 *         />
 *       ))}
 *       <Pagination
 *         currentPage={page}
 *         totalPages={Math.ceil((data?.data.total || 0) / 10)}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * 
 * function NotificationItem({ notification }: { notification: Notification }) {
 *   const { mutate: markAsRead } = useMarkNotificationAsRead();
 * 
 *   const handleMarkAsRead = () => {
 *     if (!notification.isRead) {
 *       markAsRead(notification.id);
 *     }
 *   };
 * 
 *   return (
 *     <div onClick={handleMarkAsRead}>
 *       <h2>{notification.message}</h2>
 *       <p>状态: {notification.isRead ? '已读' : '未读'}</p>
 *       <p>时间: {new Date(notification.createdAt).toLocaleString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */ 
