import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActivityList,
  createActivity,
  getActivity,
  updateActivity,
  deleteActivity,
  updateActivityStatus,
  getOrganizerActivities,
  getPopularActivities,
  getActivityStats,
} from '@/api/activity';
import { useToast } from '@/hooks/use-toast';
import type { ActivityStatusType } from '@/types/activity.types';

/**
 * 获取活动列表的hook
 */
export function useActivityList(params: {
  status?: ActivityStatusType;
  categoryId?: number;
  startTime?: Date;
  endTime?: Date;
  page?: number;
  pageSize?: number;
  orderBy?: 'startTime' | 'createdAt';
  order?: 'asc' | 'desc';
}) {
  const { toast } = useToast();
  const {
    status,
    categoryId,
    startTime,
    endTime,
    page = 1,
    pageSize = 20,
    orderBy = 'startTime',
    order = 'desc'
  } = params;

  return useQuery({
    queryKey: [
      'activities',
      status,
      categoryId,
      startTime?.toISOString(),
      endTime?.toISOString(),
      page,
      pageSize,
      orderBy,
      order
    ],
    queryFn: () => getActivityList({
      status,
      categoryId,
      startTime,
      endTime,
      page,
      pageSize,
      orderBy,
      order
    }),
    retry: false,
    gcTime: 0, // 不缓存数据
    refetchOnMount: true, // 组件挂载时重新请求
    refetchOnWindowFocus: true, // 窗口聚焦时重新请求
  });
}

/**
 * 获取单个活动详情的hook
 */
export function useActivity(id: number) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivity(id),
    enabled: !!id,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 创建活动的hook
 */
export function useCreateActivity() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: (response) => {
      if (response.code === 201) {
        toast({
          title: '活动创建成功',
          description: '活动已提交，等待审核',
          variant: 'default',
        });
        // 创建成功后，使活动列表缓存失效，触发重新获取
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '活动创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 更新活动的hook
 */
export function useUpdateActivity(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateActivity>[1]) => updateActivity(id, data),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '活动更新成功',
          description: '活动信息已更新',
          variant: 'default',
        });
        // 更新成功后，使相关缓存失效
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['activity', id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '活动更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 删除活动的hook
 */
export function useDeleteActivity() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '活动删除成功',
          description: '活动已删除',
          variant: 'default',
        });
        // 删除成功后，使活动列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '活动删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 更新活动状态的hook
 */
export function useUpdateActivityStatus(id: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { status: ActivityStatusType; reason?: string }) =>
      updateActivityStatus(id, params.status),
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '状态更新成功',
          description: '活动状态已更新',
          variant: 'default',
        });
        // 更新成功后，使相关缓存失效
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['activity', id] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '状态更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 获取组织者活动列表的hook
 */
export function useOrganizerActivities(organizerId: number, params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['organizer-activities', organizerId, params?.page, params?.pageSize],
    queryFn: () => getOrganizerActivities(organizerId, params),
    enabled: !!organizerId,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取热门活动的hook
 */
export function usePopularActivities(limit?: number) {
  return useQuery({
    queryKey: ['popular-activities', limit],
    queryFn: () => getPopularActivities(limit),
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取活动统计数据的hook
 */
export function useActivityStats() {
  return useQuery({
    queryKey: ['activity-stats'],
    queryFn: getActivityStats,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 使用示例：
 * ```typescript
 * function ActivityList() {
 *   const [page, setPage] = useState(1);
 *   const [status, setStatus] = useState<ActivityStatusType>();
 * 
 *   const { data, isLoading } = useActivityList({
 *     status,
 *     page,
 *     pageSize: 20,
 *     orderBy: 'startTime',
 *     order: 'desc'
 *   });
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>活动列表</h1>
 *       {data?.data.items.map(activity => (
 *         <div key={activity.id}>
 *           <h2>{activity.title}</h2>
 *           <p>{activity.description}</p>
 *           <p>地点：{activity.location}</p>
 *           <p>开始时间：{new Date(activity.startTime).toLocaleString()}</p>
 *           <p>结束时间：{new Date(activity.endTime).toLocaleString()}</p>
 *           <p>容量：{activity.capacity}</p>
 *         </div>
 *       ))}
 *       <Pagination
 *         currentPage={page}
 *         totalPages={data?.data.totalPages || 1}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * 
 * function ActivityDetail({ id }: { id: number }) {
 *   const { data, isLoading } = useActivity(id);
 *   const { mutate: updateStatus } = useUpdateActivityStatus(id);
 *   const { mutate: deleteActivity } = useDeleteActivity();
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>{data?.data.title}</h1>
 *       <button onClick={() => updateStatus({ status: ActivityStatus.PUBLISHED })}>
 *         发布活动
 *       </button>
 *       <button onClick={() => deleteActivity(id)}>
 *         删除活动
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * function PopularActivities() {
 *   const { data } = usePopularActivities(5);
 *   const { data: stats } = useActivityStats();
 * 
 *   return (
 *     <div>
 *       <h2>热门活动</h2>
 *       {data?.data.map(activity => (
 *         <div key={activity.id}>{activity.title}</div>
 *       ))}
 *       <h2>活动统计</h2>
 *       <p>最近活动数：{stats?.data.recentCount}</p>
 *     </div>
 *   );
 * }
 * ```
 */ 
