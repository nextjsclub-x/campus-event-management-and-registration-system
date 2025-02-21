import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import type { Activity } from '@/types/activity.types';
import { getActivityDisplayStatus, ActivityStatus } from '@/types/activity.types';
import { useActivityList } from '@/hooks/use-activity';
import { useRouter } from 'next/navigation';

export function ActivityTable() {
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const { data: activitiesData, isLoading } = useActivityList({
    page,
    pageSize,
    orderBy: 'startTime',
    order: 'desc',
  });

  const activities = activitiesData?.data;

  const handleActivityClick = (activity: Activity, e: React.MouseEvent) => {
    e.preventDefault();
    const displayStatus = getActivityDisplayStatus(activity);

    if (activity.status === ActivityStatus.PENDING) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (!displayStatus.isClickable) {
      toast.error('该活动暂不可报名');
      return;
    }

    router.push(`/activities/${activity.id}`);
  };

  if (isLoading) {
    return (
      <div className='h-[400px] w-full flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md border'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>加载中...</span>
        </div>
      </div>
    );
  }

  if (!activities || activities.items.length === 0) {
    return (
      <div className='h-[400px] w-full flex items-center justify-center rounded-md border'>
        <span className='text-muted-foreground'>暂无活动</span>
      </div>
    );
  }

  return (
    <>
      {showAlert && (
        <Alert variant='destructive'
          className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>访问受限</AlertTitle>
          <AlertDescription>
            活动正在审核中，暂时无法查看详情
          </AlertDescription>
        </Alert>
      )}

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
              const displayStatus = getActivityDisplayStatus(activity);
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{activity.title}</div>
                      <div className='text-sm text-muted-foreground line-clamp-1'>
                        {activity.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(activity.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>
                    {activity.currentRegistrations || 0}/{activity.capacity}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${displayStatus.className}`}
                    >
                      {displayStatus.status}
                    </span>
                  </TableCell>
                  <TableCell className='text-right'>
                    <button
                      type='button'
                      onClick={(e) => handleActivityClick(activity, e)}
                      className='text-sm text-muted-foreground hover:text-primary transition-colors'
                    >
                      查看详情
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-center gap-2 mt-6'>
        <Button
          variant='outline'
          disabled={!activities.hasPrev || isLoading}
          onClick={() => setPage(page - 1)}
        >
          上一页
        </Button>
        <span className='py-2 px-4'>
          第 {activities.currentPage} 页 / 共 {activities.totalPages} 页
        </span>
        <Button
          variant='outline'
          disabled={!activities.hasNext || isLoading}
          onClick={() => setPage(page + 1)}
        >
          下一页
        </Button>
      </div>
    </>
  );
} 
