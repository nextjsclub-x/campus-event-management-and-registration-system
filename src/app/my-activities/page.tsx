'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';

interface Activity {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentRegistrations: number;
  status: number;
}

export default function MyActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await get('/api/my-activities');
      if (response.code === APIStatusCode.OK) {
        setActivities(response.data.activities);
      } else {
        toast.error(response.message || '获取活动列表失败');
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant='destructive'>已删除</Badge>;
      case 1:
        return <Badge variant='secondary'>草稿</Badge>;
      case 2:
        return <Badge>已发布</Badge>;
      case 3:
        return <Badge variant='outline'>已取消</Badge>;
      case 4:
        return <Badge variant='secondary'>已结束</Badge>;
      default:
        return <Badge variant='outline'>未知状态</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8'>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>我发起的活动</h1>
        <Button onClick={() => router.push('/activities/create')}>
          创建活动
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活动列表</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
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
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>{new Date(activity.startTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(activity.endTime).toLocaleString()}</TableCell>
                    <TableCell>{activity.location}</TableCell>
                    <TableCell>{activity.currentRegistrations}/{activity.capacity}</TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      <div className='space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => router.push(`/admin/activities/${activity.id}`)}
                        >
                          查看详情
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='text-center py-4 text-muted-foreground'>
              暂无活动
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
