import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/analytics';
import { useToast } from '@/hooks/use-toast';
import type { APIResponse } from '@/types/api-response.types';
import type { DashboardStatistics } from '@/models/analytics/get-dashboard-statistics';

/**
 * 获取仪表盘统计数据的hook
 */
export function useDashboardStats() {
  const { toast } = useToast();

  return useQuery<APIResponse<DashboardStatistics>, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        return await getDashboardStats();
      } catch (error) {
        toast({
          title: '获取统计数据失败',
          description: error instanceof Error ? error.message : '请稍后重试',
          variant: 'destructive',
        });
        throw error;
      }
    },
    retry: false,
    gcTime: 0, // 不缓存数据
    refetchOnMount: true, // 组件挂载时重新请求
    refetchOnWindowFocus: true, // 窗口聚焦时重新请求
  });
}

/**
 * 使用示例：
 * 
 * ```tsx
 * import { useDashboardStats } from '@/hooks/use-analytics';
 * import { PieChart, BarChart } from 'recharts';
 * 
 * export function DashboardStats() {
 *   const { data, isLoading } = useDashboardStats();
 * 
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 * 
 *   const {
 *     registrationStats,
 *     categoryDistribution,
 *     activityRatings,
 *     topParticipants,
 *     recentActivityStats
 *   } = data?.data || {};
 * 
 *   return (
 *     <div>
 *       <div>
 *         <h2>报名状态统计</h2>
 *         <PieChart data={registrationStats} />
 *       </div>
 * 
 *       <div>
 *         <h2>活动类别分布</h2>
 *         <PieChart data={categoryDistribution} />
 *       </div>
 * 
 *       <div>
 *         <h2>活动评分分布</h2>
 *         <BarChart data={activityRatings} />
 *       </div>
 * 
 *       <div>
 *         <h2>最活跃参与者</h2>
 *         <BarChart data={topParticipants} />
 *       </div>
 * 
 *       <div>
 *         <h2>最近活动统计</h2>
 *         <div>
 *           <p>总活动数：{recentActivityStats?.total}</p>
 *           <p>本周新增：{recentActivityStats?.thisWeek}</p>
 *           <p>本月新增：{recentActivityStats?.thisMonth}</p>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */ 
