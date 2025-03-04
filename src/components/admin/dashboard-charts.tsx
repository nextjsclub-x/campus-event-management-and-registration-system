'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface StatusDataItem {
  status: number;
  count: number;
  name: string;
}

interface DashboardChartsProps {
  statusData: StatusDataItem[];
  registrationStatusData: StatusDataItem[];
  recentActivities: { date: string; count: number }[];
  recentRegistrations: { date: string; count: number }[];
  categoryStats: {
    categoryActivityCount: {
      categoryId: number;
      categoryName: string | null;
      count: number;
    }[];
    categoryRegistrationCount: {
      categoryId: number;
      categoryName: string | null;
      registrationCount: number;
    }[];
  };
}

export function DashboardCharts({
  statusData,
  registrationStatusData,
  recentActivities,
  recentRegistrations,
  categoryStats,
}: DashboardChartsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* 活动状态分布 */}
      <Card className='shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader>
          <CardTitle>活动状态分布</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%'
            height='100%'>
            <PieChart>
              <Pie
                data={statusData}
                dataKey='count'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={80}
                label
              >
                {statusData.map((item: StatusDataItem, index: number) => (
                  <Cell
                    key={`status-${item.status}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 报名状态分布 */}
      <Card className='shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader>
          <CardTitle>报名状态分布</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%'
            height='100%'>
            <PieChart>
              <Pie
                data={registrationStatusData}
                dataKey='count'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={80}
                label
              >
                {registrationStatusData.map(
                  (item: StatusDataItem, index: number) => (
                    <Cell
                      key={`registration-status-${item.status}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ),
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 最近一周活动趋势 */}
      <Card className='shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader>
          <CardTitle>最近一周活动趋势</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%'
            height='100%'>
            <LineChart data={recentActivities}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='count'
                stroke='#8884d8'
                name='活动数量'
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 最近一周报名趋势 */}
      <Card className='shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader>
          <CardTitle>最近一周报名趋势</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%'
            height='100%'>
            <LineChart data={recentRegistrations}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type='monotone'
                dataKey='count'
                stroke='#82ca9d'
                name='报名数量'
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 分类统计 */}
      <Card className='shadow-lg hover:shadow-xl transition-shadow'>
        <CardHeader>
          <CardTitle>分类活动数量</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%'
            height='100%'>
            <BarChart data={categoryStats.categoryActivityCount}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='categoryName' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey='count'
                fill='#8884d8'
                name='活动数量'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}


