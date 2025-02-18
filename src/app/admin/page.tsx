import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getOverviewStatistics,
  getActivityStatistics,
  getRegistrationStatistics,
  getCategoryStatistics,
} from '@/service/statistics.service';
import {
  ActivityStatus,
  RegistrationStatus,
  type ActivityCount,
  type PopularActivity,
  type StatusDataItem,
} from '@/types/statistics.types';
import { DashboardCharts } from '@/components/admin/dashboard-charts';

const STATUS_NAMES: Record<number, string> = {
  [ActivityStatus.DRAFT]: '草稿',
  [ActivityStatus.PUBLISHED]: '已发布',
  [ActivityStatus.CANCELLED]: '已取消',
  [ActivityStatus.COMPLETED]: '已完成',
};

const REGISTRATION_STATUS_NAMES: Record<number, string> = {
  [RegistrationStatus.PENDING]: '待审核',
  [RegistrationStatus.REJECTED]: '已拒绝',
  [RegistrationStatus.CANCELLED]: '已取消',
};

export default async function AdminPage() {
  // 获取所有统计数据
  const [overview, activityStats, registrationStats, categoryStats] =
    await Promise.all([
      getOverviewStatistics(),
      getActivityStatistics(),
      getRegistrationStatistics(),
      getCategoryStatistics(),
    ]);

  // 处理活动状态数据，添加状态名称
  const statusData = activityStats.statusCount.map((item: ActivityCount) => ({
    ...item,
    name: STATUS_NAMES[item.status] || `状态${item.status}`,
  }));

  // 处理报名状态数据，添加状态名称
  const registrationStatusData = registrationStats.statusCount.map((item: ActivityCount) => ({
    ...item,
    name: REGISTRATION_STATUS_NAMES[item.status] || `状态${item.status}`,
  }));

  return (
    <div className='w-full space-y-6 p-6'>
      {/* 概览数据 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='shadow-lg hover:shadow-xl transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总活动数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overview.totalActivities}</div>
            <p className='text-xs text-muted-foreground'>
              本月新增 {overview.newActivitiesThisMonth}
            </p>
          </CardContent>
        </Card>
        <Card className='shadow-lg hover:shadow-xl transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>总报名人次</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overview.totalRegistrations}</div>
            <p className='text-xs text-muted-foreground'>
              本月新增 {overview.newRegistrationsThisMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        statusData={statusData}
        registrationStatusData={registrationStatusData}
        recentActivities={activityStats.recentActivities}
        recentRegistrations={registrationStats.recentRegistrations}
        categoryStats={categoryStats}
      />
    </div>
  );
}
