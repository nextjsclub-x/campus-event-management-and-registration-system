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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Activity, ActivityStatusType } from '@/types/activity.types';
import { ActivityStatus } from '@/types/activity.types';

interface ActivitiesClientProps {
  activities: Activity[];
  onStatusChange: (status: ActivityStatusType | undefined) => void;
  currentStatus?: ActivityStatusType;
}

const statusMap: Record<
  ActivityStatusType,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  [ActivityStatus.PENDING]: { label: '待审核', variant: 'secondary' },
  [ActivityStatus.PUBLISHED]: { label: '已发布', variant: 'default' },
  [ActivityStatus.CANCELLED]: { label: '已取消', variant: 'outline' },
  [ActivityStatus.COMPLETED]: { label: '已结束', variant: 'secondary' },
  [ActivityStatus.DELETED]: { label: '已删除', variant: 'destructive' },
};

const isValidActivityStatus = (value: number): value is ActivityStatusType =>
  Object.values(ActivityStatus).includes(value as ActivityStatusType);

export function ActivitiesClient({
  activities,
  onStatusChange,
  currentStatus,
}: ActivitiesClientProps) {
  const router = useRouter();

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      onStatusChange(undefined);
      return;
    }

    try {
      const numValue = Number(value);
      if (isValidActivityStatus(numValue)) {
        onStatusChange(numValue);
      }
    } catch (error) {
      console.error('无效的状态值:', error);
    }
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>活动管理</h1>
        <div className='flex items-center gap-4'>
          <Select
            value={currentStatus?.toString() || 'all'}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='选择状态过滤' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              {Object.entries(statusMap).map(([status, { label }]) => (
                <SelectItem key={status}
                  value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant='outline'
            onClick={() => router.push('/admin')}>
            返回
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活动列表</CardTitle>
        </CardHeader>
        <CardContent>
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
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}
                    className='text-center'>
                    暂无活动
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
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
                      {activity.currentRegistrations ?? 0}/{activity.capacity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusMap[activity.status as ActivityStatusType]
                            ?.variant
                        }
                      >
                        {
                          statusMap[activity.status as ActivityStatusType]
                            ?.label
                        }
                      </Badge>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

