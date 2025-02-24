'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useMyActivities } from '@/hooks/use-activity';
import { ActivityStatus } from '@/types/activity.types';
import type { Activity, ActivityStatusType } from '@/types/activity.types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/store/user';

const activityStatusMap: Record<number, string> = {
  [ActivityStatus.PENDING]: '待审核',
  [ActivityStatus.PUBLISHED]: '已发布',
  [ActivityStatus.CANCELLED]: '已取消',
  [ActivityStatus.COMPLETED]: '已结束',
  [ActivityStatus.DELETED]: '已删除',
};

export default function MyActivitiesPage() {
  const { isAuthenticated } = useUserStore();
  const [status, setStatus] = useState<ActivityStatusType | undefined>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyActivities({
    status,
    page,
    pageSize: 10,
    orderBy: 'startTime',
    order: 'desc'
  });

  const renderTableContent = () => {
    if (isLoading || !isAuthenticated) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!data?.data?.items?.length) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            className='text-center py-10 text-muted-foreground'
          >
            暂无活动
          </TableCell>
        </TableRow>
      );
    }

    return data.data.items.map((activity: Activity) => (
      <TableRow key={activity.id}>
        <TableCell>{activity.title}</TableCell>
        <TableCell>
          {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')}
        </TableCell>
        <TableCell>{activityStatusMap[activity.status]}</TableCell>
        <TableCell>{activity.currentRegistrations}/{activity.capacity}</TableCell>
        <TableCell>
          <div className='space-x-2'>
            <Link href={`/activities/${activity.id}`}>
              <Button
                variant='outline'
                size='sm'
              >
                查看
              </Button>
            </Link>
            <Link href={`/activities/${activity.id}/edit`}>
              <Button
                variant='outline'
                size='sm'
              >
                编辑
              </Button>
            </Link>
            <Link href={`/activities/${activity.id}/registrations`}>
              <Button
                variant='outline'
                size='sm'
              >
                审核报名
              </Button>
            </Link>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='text-center py-10'>
            请先登录
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>我的活动</h1>
        <Link href='/activities/create'>
          <Button>创建活动</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>已创建的活动</CardTitle>
            <Select
              value={status?.toString() || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? undefined : Number(value) as ActivityStatusType)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='全部状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部状态</SelectItem>
                {Object.entries(activityStatusMap).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>活动名称</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>报名人数</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
