import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRegistrationList,
  createRegistration,
  cancelRegistration,
  getRegistrationStats,
  getRegistrationAnalytics,
  getActivityRegistrations,
} from '@/api/registration';
import { useToast } from '@/hooks/use-toast';
import type { 
  AdminRegistrationsResponse,
  ActivityRegistrationsResponse,
} from '@/types/registration.types';
import type { APIResponse } from '@/types/api-response.types';

/**
 * 获取报名列表的hook
 */
export function useRegistrationList(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery<APIResponse<AdminRegistrationsResponse>, Error>({
    queryKey: ['registrations', params?.page, params?.pageSize],
    queryFn: () => getRegistrationList(params),
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取活动报名列表的hook
 */
export function useActivityRegistrations(activityId: number, params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery<APIResponse<ActivityRegistrationsResponse>, Error>({
    queryKey: ['activity-registrations', activityId, params?.page, params?.pageSize],
    queryFn: () => getActivityRegistrations(activityId, params),
    enabled: !!activityId,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 创建报名的hook
 */
export function useCreateRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '报名成功',
          description: '您已成功报名参加活动',
          variant: 'default',
        });
        // 创建成功后，使报名列表缓存失效
        queryClient.invalidateQueries({ queryKey: ['registrations'] });
        // 同时使活动详情缓存失效，因为报名会影响活动的currentParticipants
        queryClient.invalidateQueries({ queryKey: ['activity'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '报名失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 取消报名的hook
 */
export function useCancelRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRegistration,
    onSuccess: (response) => {
      if (response.code === 200) {
        toast({
          title: '取消成功',
          description: '您已成功取消报名',
          variant: 'default',
        });
        // 取消成功后，使相关缓存失效
        queryClient.invalidateQueries({ queryKey: ['registrations'] });
        queryClient.invalidateQueries({ queryKey: ['activity'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '取消失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    },
  });
}

/**
 * 获取报名统计信息的hook
 */
export function useRegistrationStats() {
  return useQuery({
    queryKey: ['registration-stats'],
    queryFn: getRegistrationStats,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 获取报名分析数据的hook
 */
export function useRegistrationAnalytics(params?: {
  activityId?: number;
  days?: number;
}) {
  return useQuery({
    queryKey: ['registration-analytics', params?.activityId, params?.days],
    queryFn: () => getRegistrationAnalytics(params),
    enabled: !!params?.activityId,
    retry: false,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * 使用示例：
 * ```typescript
 * function RegistrationList({ activityId }: { activityId: number }) {
 *   const [page, setPage] = useState(1);
 *   const { data, isLoading } = useRegistrationList({
 *     activityId,
 *     page,
 *     pageSize: 20
 *   });
 * 
 *   const { mutate: createRegistration } = useCreateRegistration();
 *   const { mutate: cancelRegistration } = useCancelRegistration();
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <h2>报名列表</h2>
 *       {data?.data.registrations.map(registration => (
 *         <div key={registration.id}>
 *           <p>{registration.user.username}</p>
 *           <p>报名时间：{new Date(registration.registeredAt).toLocaleString()}</p>
 *           <button onClick={() => cancelRegistration(registration.id)}>
 *             取消报名
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */ 
