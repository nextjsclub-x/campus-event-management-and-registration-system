'use client';

import { useParams, useRouter } from 'next/navigation';
import { useActivity, useUpdateActivityStatus } from '@/hooks/use-activity';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityStatus, ActivityStatusTransitions, type ActivityStatusType } from '@/types/activity.types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading } = useActivity(Number(params.id));
  const { mutate: updateStatus } = useUpdateActivityStatus(Number(params.id));

  if (isLoading) {
    return <Skeleton className='h-[400px]' />;
  }

  const activity = data?.data;
  if (!activity) {
    return <div className='text-center py-8'>未找到活动</div>;
  }

  const handleApprove = () => {
    const currentStatus = activity.status as ActivityStatusType;
    console.log('当前状态:', currentStatus);
    console.log('允许的转换:', ActivityStatusTransitions[currentStatus]);
    console.log('目标状态:', ActivityStatus.PUBLISHED);

    // 检查状态转换是否有效
    const isValidTransition = ActivityStatusTransitions[currentStatus]?.includes(ActivityStatus.PUBLISHED);
    console.log('是否允许转换:', isValidTransition);

    if (!isValidTransition) {
      toast({
        title: '状态更新失败',
        description: `当前状态(${currentStatus})不允许转换到已发布状态`,
        variant: 'destructive',
      });
      return;
    }

    try {
      updateStatus({
        status: ActivityStatus.PUBLISHED,
        reason: '管理员审核通过'
      });
      toast({
        title: '状态更新成功',
        description: '活动已发布',
      });
    } catch (error) {
      console.error('状态更新错误:', error);
      toast({
        title: '状态更新失败',
        description: error instanceof Error ? error.message : '更新失败，请重试',
        variant: 'destructive',
      });
    }
  };

  const handleReject = () => {
    const currentStatus = activity.status as ActivityStatusType;
    console.log('当前状态:', currentStatus);
    console.log('允许的转换:', ActivityStatusTransitions[currentStatus]);
    console.log('目标状态:', ActivityStatus.DELETED);

    // 检查状态转换是否有效
    const isValidTransition = ActivityStatusTransitions[currentStatus]?.includes(ActivityStatus.DELETED);
    console.log('是否允许转换:', isValidTransition);

    if (!isValidTransition) {
      toast({
        title: '状态更新失败',
        description: `当前状态(${currentStatus})不允许转换到已删除状态`,
        variant: 'destructive',
      });
      return;
    }

    try {
      updateStatus({
        status: ActivityStatus.DELETED,
        reason: '管理员审核不通过'
      });
      toast({
        title: '状态更新成功',
        description: '活动已删除',
      });
    } catch (error) {
      console.error('状态更新错误:', error);
      toast({
        title: '状态更新失败',
        description: error instanceof Error ? error.message : '更新失败，请重试',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: number) => {
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

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>活动详情</CardTitle>
            <div className='mt-2'>
              {getStatusBadge(activity.status)}
              <span className='ml-2 text-sm text-muted-foreground'>
                (状态码: {activity.status})
              </span>
            </div>
          </div>
          {activity.status === ActivityStatus.PENDING && (
            <div className='flex gap-2'>
              <Button onClick={handleApprove}
                variant='default'>
                通过
              </Button>
              <Button onClick={handleReject}
                variant='destructive'>
                拒绝
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动标题</h3>
              <p>{activity.title}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动分类</h3>
              <p>分类 {activity.categoryId || '未分类'}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动地点</h3>
              <p>{activity.location}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>人数限制</h3>
              <p>{activity.currentRegistrations}/{activity.capacity}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>开始时间</h3>
              <p>{new Date(activity.startTime).toLocaleString()}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>结束时间</h3>
              <p>{new Date(activity.endTime).toLocaleString()}</p>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            <h3 className='font-medium text-muted-foreground'>活动描述</h3>
            <p className='whitespace-pre-wrap'>{activity.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
