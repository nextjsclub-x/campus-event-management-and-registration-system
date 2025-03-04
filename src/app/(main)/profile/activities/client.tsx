'use client';

// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { ActivityStatus } from '@/types/activity.types';
import type { Activity } from '@/types/activity.types';
import { format } from 'date-fns';

const activityStatusMap: Record<number, string> = {
  [ActivityStatus.PENDING]: '待审核',
  [ActivityStatus.PUBLISHED]: '已发布',
  [ActivityStatus.CANCELLED]: '已取消',
  [ActivityStatus.COMPLETED]: '已结束',
  [ActivityStatus.DELETED]: '已删除',
};

interface ActivitiesClientProps {
  activities: Activity[];
}

export function ActivitiesClient({ activities }: ActivitiesClientProps) {
  // const router = useRouter();

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
          <CardTitle>已创建的活动</CardTitle>
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
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center py-10 text-muted-foreground'
                  >
                    暂无活动
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      {format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell>{activityStatusMap[activity.status]}</TableCell>
                    <TableCell>
                      {activity.currentRegistrations}/{activity.capacity}
                    </TableCell>
                    <TableCell>
                      <div className='space-x-2'>
                        <Link href={`/activities/${activity.id}`}>
                          <Button variant='outline'
                            size='sm'>
                            查看
                          </Button>
                        </Link>
                        <Link href={`/activities/${activity.id}/edit`}>
                          <Button variant='outline'
                            size='sm'>
                            编辑
                          </Button>
                        </Link>
                        <Link href={`/activities/${activity.id}`}>
                          <Button variant='outline'
                            size='sm'>
                            审核报名
                          </Button>
                        </Link>
                      </div>
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
