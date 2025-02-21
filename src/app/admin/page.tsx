'use client';

import { useDashboardStats } from '@/hooks/use-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const getRegistrationStatusName = (status: number): string => {
  switch (status) {
    case 1: return '待审核';
    case 2: return '已批准';
    case 3: return '已拒绝';
    case 4: return '候补';
    case 5: return '已参加';
    default: return '已取消';
  }
};

const LOADING_CARDS = [
  'recent-stats',
  'registration-stats',
  'category-stats',
  'rating-stats',
  'participant-stats',
  'extra-stats'
] as const;

const LoadingSkeleton = () => (
  <div className='min-h-screen p-4 space-y-4'>
    <Skeleton className='h-8 w-[200px] mb-6' />
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {LOADING_CARDS.map((id) => (
        <Card key={id}>
          <CardHeader>
            <Skeleton className='h-4 w-[150px]' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px]' />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const stats = data?.data;
  if (!stats) return null;

  // 转换数据格式以适应 recharts
  const registrationData = stats.registrationStats.map(stat => ({
    name: getRegistrationStatusName(stat.status),
    value: stat.count
  }));

  const categoryData = stats.categoryDistribution.map(cat => ({
    name: cat.name,
    value: cat.count
  }));

  const ratingData = stats.activityRatings.map(rating => ({
    name: `${rating.rating}星`,
    count: rating.count
  }));

  return (
    <div className='min-h-screen bg-background'>
      <div className='p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>管理员仪表盘</h1>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* 最近活动统计卡片 */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>最近活动统计</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>总活动数</span>
                <span className='text-2xl font-bold'>{stats.recentActivityStats.total}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>本周新增</span>
                <span className='text-2xl font-bold text-green-600'>{stats.recentActivityStats.thisWeek}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>本月新增</span>
                <span className='text-2xl font-bold text-blue-600'>{stats.recentActivityStats.thisMonth}</span>
              </div>
            </CardContent>
          </Card>

          {/* 报名状态分布 */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>报名状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[250px]'>
                <ResponsiveContainer width='100%'
                  height='100%'>
                  <PieChart>
                    <Pie
                      data={registrationData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {registrationData.map((entry) => (
                        <Cell
                          key={`cell-reg-${entry.name}`}
                          fill={COLORS[registrationData.indexOf(entry) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 活动类别分布 */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>活动类别分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[250px]'>
                <ResponsiveContainer width='100%'
                  height='100%'>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={`cell-cat-${entry.name}`}
                          fill={COLORS[categoryData.indexOf(entry) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 活动评分分布 */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>活动评分分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[250px]'>
                <ResponsiveContainer width='100%'
                  height='100%'>
                  <BarChart data={ratingData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='count'
                      fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 最活跃参与者 */}
          <Card className='col-span-1'>
            <CardHeader>
              <CardTitle>最活跃参与者</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[250px]'>
                <ResponsiveContainer width='100%'
                  height='100%'>
                  <BarChart data={stats.topParticipants}
                    layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='name'
                      type='category'
                      width={100} />
                    <Tooltip />
                    <Bar dataKey='participationCount'
                      fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
