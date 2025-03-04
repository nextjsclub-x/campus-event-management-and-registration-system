'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import {
	ActivityStatus,
	ActivityStatusTransitions,
	type ActivityStatusType,
	type Activity,
} from '@/types/activity.types';

interface ActivityClientProps {
	activity: Activity;
	updateAction: (
		id: number,
		status: ActivityStatusType,
		reason: string,
	) => Promise<Activity>;
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

export function ActivityClient({
	activity,
	updateAction,
}: ActivityClientProps): JSX.Element {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

	const handleStatusChange = async (
		newStatus: ActivityStatusType,
		reason: string,
	) => {
		setIsPending(true);
		const currentStatus = activity.status as ActivityStatusType;
		const isValidTransition =
			ActivityStatusTransitions[currentStatus]?.includes(newStatus);

		if (!isValidTransition) {
			toast.error('状态更新失败', {
				description: `当前状态(${statusMap[currentStatus].label})不允许转换到${statusMap[newStatus].label}状态`,
			});
			setIsPending(false);
			return;
		}

		try {
			await updateAction(activity.id, newStatus, reason);
			toast.success('活动状态更新成功');
			router.refresh();
		} catch (error) {
			toast.error('更新失败', {
				description: error instanceof Error ? error.message : '请稍后重试',
			});
		} finally {
			setIsPending(false);
		}
	};

	return (
  <div className='container mx-auto py-8'>
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>活动详情</h1>
        <Button
          variant='outline'
          onClick={() => router.push('/admin/activities')}
					>
          返回列表
        </Button>
      </div>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>基本信息</CardTitle>
            <div className='mt-2'>
              <Badge
                variant={
										statusMap[activity.status as ActivityStatusType]?.variant
									}
								>
                {statusMap[activity.status as ActivityStatusType]?.label}
              </Badge>
            </div>
          </div>
          {activity.status === ActivityStatus.PENDING && (
          <div className='flex gap-2'>
            <Button
              onClick={() =>
										handleStatusChange(
											ActivityStatus.PUBLISHED,
											'管理员审核通过',
										)
									}
              variant='default'
								>
              通过
            </Button>
            <Button
              onClick={() =>
										handleStatusChange(
											ActivityStatus.DELETED,
											'管理员审核不通过',
										)
									}
              variant='destructive'
								>
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
              <p>
                {activity.currentRegistrations ?? 0}/{activity.capacity}
              </p>
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
    <Toaster />
  </div>
	);
}
