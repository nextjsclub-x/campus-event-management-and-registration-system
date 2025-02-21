/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActivityList } from '@/hooks/use-activity';
import type { Activity, ActivityStatusType } from '@/types/activity.types';
import { ActivityStatus } from '@/types/activity.types';
import { Skeleton } from '@/components/ui/skeleton';

const isValidActivityStatus = (value: number): value is ActivityStatusType => Object.values(ActivityStatus).includes(value as ActivityStatusType);

export default function AdminActivitiesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ActivityStatusType | undefined>(undefined);
  const { data, isLoading } = useActivityList({
    status: statusFilter,
    pageSize: 50,
  });

  const getStatusBadge = (status: ActivityStatusType) => {
    switch (status) {
      case ActivityStatus.PENDING:
        return <Badge variant='secondary'>待审核</Badge>;
      case ActivityStatus.PUBLISHED:
        return <Badge>已发布</Badge>;
      case ActivityStatus.CANCELLED:
        return <Badge variant='outline'>已取消</Badge>;
      case ActivityStatus.COMPLETED:
        return <Badge variant='secondary'>已结束</Badge>;
      case ActivityStatus.DELETED:
        return <Badge variant='destructive'>已删除</Badge>;
      default:
        return <Badge variant='outline'>未知状态</Badge>;
    }
  };

  const getStatusLabel = (status: ActivityStatusType) => {
    switch (status) {
      case ActivityStatus.PENDING:
        return '待审核';
      case ActivityStatus.PUBLISHED:
        return '已发布';
      case ActivityStatus.CANCELLED:
        return '已取消';
      case ActivityStatus.COMPLETED:
        return '已结束';
      case ActivityStatus.DELETED:
        return '已删除';
      default:
        return '未知状态';
    }
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      setStatusFilter(undefined);
      return;
    }

    try {
      const numValue = Number(value);
      if (isValidActivityStatus(numValue)) {
        setStatusFilter(numValue);
      }
    } catch (error) {
      console.error('无效的状态值:', error);
    }
  };

  if (isLoading) {
    return <Skeleton className='h-[400px]' />;
  }

  const activities = data?.data?.items || [];

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>活动管理</h1>
        <Select
          value={statusFilter?.toString() || 'all'}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='选择状态过滤' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部状态</SelectItem>
            {Object.values(ActivityStatus).map((status) => (
              <SelectItem
                key={status}
                value={status.toString()}
              >
                {getStatusLabel(status as ActivityStatusType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>开始时间</TableHead>
              <TableHead>结束时间</TableHead>
              <TableHead>地点</TableHead>
              <TableHead>报名人数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity: Activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.id}</TableCell>
                <TableCell>{activity.title}</TableCell>
                <TableCell>
                  {new Date(activity.startTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(activity.endTime).toLocaleString()}
                </TableCell>
                <TableCell>{activity.location}</TableCell>
                <TableCell>
                  {activity.currentRegistrations}/{activity.capacity}
                </TableCell>
                <TableCell>
                  {getStatusBadge(activity.status as ActivityStatusType)}
                </TableCell>
                <TableCell>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      router.push(`/admin/activities/${activity.id}`)
                    }
                  >
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
