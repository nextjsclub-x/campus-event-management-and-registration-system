/* eslint-disable @typescript-eslint/no-use-before-define */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { get, put } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
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

const ActivityStatus = {
  DELETED: 0,
  DRAFT: 1,
  PUBLISHED: 2,
  CANCELLED: 3,
  COMPLETED: 4,
} as const;

export default function AdminActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [statusFilter]);

  const fetchActivities = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await get(`/api/activities${params}`);
      if (response.code === APIStatusCode.OK) {
        setActivities(response.data.activities);
      } else {
        alert(response.message || '获取活动列表失败');
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      alert('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (activityId: number, newStatus: number) => {
    try {
      const response = await put(`/api/activities/${activityId}/status`, { status: newStatus });
      if (response.code === APIStatusCode.OK) {
        // 更新成功后刷新列表
        fetchActivities();
      } else {
        alert(response.message || '更新状态失败');
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新状态失败');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ActivityStatus.DELETED:
        return <Badge variant='destructive'>已删除</Badge>;
      case ActivityStatus.DRAFT:
        return <Badge variant='secondary'>草稿</Badge>;
      case ActivityStatus.PUBLISHED:
        return <Badge>已发布</Badge>;
      case ActivityStatus.CANCELLED:
        return <Badge variant='outline'>已取消</Badge>;
      case ActivityStatus.COMPLETED:
        return <Badge variant='secondary'>已结束</Badge>;
      default:
        return <Badge variant='outline'>未知状态</Badge>;
    }
  };

  const getAvailableStatuses = (currentStatus: number) => {
    const transitions: Record<number, number[]> = {
      [ActivityStatus.DRAFT]: [ActivityStatus.PUBLISHED, ActivityStatus.DELETED],
      [ActivityStatus.PUBLISHED]: [ActivityStatus.CANCELLED, ActivityStatus.COMPLETED],
      [ActivityStatus.CANCELLED]: [ActivityStatus.DELETED],
      [ActivityStatus.COMPLETED]: [ActivityStatus.DELETED],
      [ActivityStatus.DELETED]: [],
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case ActivityStatus.DELETED:
        return '已删除';
      case ActivityStatus.DRAFT:
        return '草稿';
      case ActivityStatus.PUBLISHED:
        return '已发布';
      case ActivityStatus.CANCELLED:
        return '已取消';
      case ActivityStatus.COMPLETED:
        return '已结束';
      default:
        return '未知状态';
    }
  };

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>活动管理</h1>
        <div className='flex gap-4'>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='选择状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部活动</SelectItem>
              <SelectItem value={String(ActivityStatus.DRAFT)}>草稿</SelectItem>
              <SelectItem value={String(ActivityStatus.PUBLISHED)}>已发布</SelectItem>
              <SelectItem value={String(ActivityStatus.CANCELLED)}>已取消</SelectItem>
              <SelectItem value={String(ActivityStatus.COMPLETED)}>已结束</SelectItem>
              <SelectItem value={String(ActivityStatus.DELETED)}>已删除</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            onClick={() => router.push('/admin')}
          >
            返回
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='text-center'>加载中...</div>
      ) : (
        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>活动标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>地点</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>结束时间</TableHead>
                <TableHead>人数限制</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity: any) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.title}</TableCell>
                  <TableCell>{activity.category?.name || '未分类'}</TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>{new Date(activity.startTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(activity.endTime).toLocaleString()}</TableCell>
                  <TableCell>{activity.capacity}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {getStatusBadge(activity.status)}
                      {getAvailableStatuses(activity.status).length > 0 && (
                        <Select
                          onValueChange={(value) => handleStatusChange(activity.id, parseInt(value, 10))}
                        >
                          <SelectTrigger className='w-[120px]'>
                            <SelectValue placeholder='切换状态' />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatuses(activity.status).map((status) => (
                              <SelectItem key={status}
                                value={String(status)}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => router.push(`/admin/activities/${activity.id}`)}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
