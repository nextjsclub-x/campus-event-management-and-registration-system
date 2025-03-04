import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type { Activity } from '@/types/activity.types';
import { getActivityStatus, ActivityStatus } from '@/types/activity.types';
import { listActivities } from '@/models/activity';

interface ActivityTableProps {
	page: number;
	pageSize?: number;
}

export async function ActivityTable({
	page,
	pageSize = 9,
}: ActivityTableProps) {
	const activities = await listActivities({
		status: ActivityStatus.PUBLISHED,
		page,
		pageSize,
		orderBy: 'id',
		order: 'desc',
	});

	if (!activities || activities.items.length === 0) {
		return (
  <div className='h-[400px] w-full flex items-center justify-center rounded-md border'>
    <span className='text-muted-foreground'>暂无活动</span>
  </div>
		);
	}

	return (
  <>
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>活动名称</TableHead>
            <TableHead>开始时间</TableHead>
            <TableHead>地点</TableHead>
            <TableHead>报名情况</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className='text-right'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.items.map((activity) => {
							const displayStatus = getActivityStatus(activity);
							return (
  <TableRow key={activity.id}>
    <TableCell>
      <div>
        <Link
          href={`/activities/${activity.id}`}
          className='font-medium hover:text-primary transition-colors'
											>
          {activity.title}
        </Link>
        <div className='text-sm text-muted-foreground line-clamp-1'>
          {activity.description}
        </div>
      </div>
    </TableCell>
    <TableCell>
      {new Date(activity.startTime)
											.toLocaleString('zh-CN', {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
												hour: '2-digit',
												minute: '2-digit',
												hour12: true,
											})
											.replace('AM', '上午')
											.replace('PM', '下午')}
    </TableCell>
    <TableCell>{activity.location}</TableCell>
    <TableCell>
      {activity.currentRegistrations || 0}/{activity.capacity}
    </TableCell>
    <TableCell>
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${displayStatus.className}`}
										>
        {displayStatus.status.status}
      </span>
    </TableCell>
    <TableCell className='text-right'>
      <Link
        href={`/activities/${activity.id}`}
        className='text-sm text-muted-foreground hover:text-primary transition-colors'
										>
        查看详情
      </Link>
    </TableCell>
  </TableRow>
							);
						})}
        </TableBody>
      </Table>
    </div>

    <div className='flex justify-center gap-2 mt-6'>
      <Link href={`/?page=${page - 1}`}>
        <Button variant='outline'
          disabled={!activities.hasPrev}>
          上一页
        </Button>
      </Link>
      <span className='py-2 px-4'>
        第 {activities.currentPage} 页 / 共 {activities.totalPages} 页
      </span>
      <Link href={`/?page=${page + 1}`}>
        <Button variant='outline'
          disabled={!activities.hasNext}>
          下一页
        </Button>
      </Link>
    </div>
  </>
	);
}
