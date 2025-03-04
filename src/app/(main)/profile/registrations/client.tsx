'use client';

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
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

// 定义从数据库返回的注册记录类型
interface RegistrationRecord {
  id: number;
  userId: number;
  activityId: number;
  status: number;
  registeredAt: Date;
  activityTitle: string | null;
  activityStartTime: Date | null;
  activityEndTime: Date | null;
  activityLocation: string | null;
  statusText: string;
}

interface RegistrationsClientProps {
  registrations: RegistrationRecord[];
  onCancelRegistration: (userId: number, activityId: number) => Promise<void>;
}

export function RegistrationsClient({
  registrations,
  onCancelRegistration,
}: RegistrationsClientProps) {
  return (
    <div className='container mx-auto py-6 space-y-6'>
      <h1 className='text-2xl font-bold'>我的报名</h1>

      <Card>
        <CardHeader>
          <CardTitle>已报名的活动</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>活动名称</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>报名状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}
                    className='text-center'>
                    暂无报名记录
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>{registration.activityTitle}</TableCell>
                    <TableCell>
                      {registration.activityStartTime
                        ? format(
                          new Date(registration.activityStartTime),
                          'yyyy-MM-dd HH:mm',
                        )
                        : '未设置'}
                    </TableCell>
                    <TableCell>{registration.statusText}</TableCell>
                    <TableCell>
                      <div className='space-x-2'>
                        <Link href={`/activities/${registration.activityId}`}>
                          <Button variant='outline'
                            size='sm'>
                            查看详情
                          </Button>
                        </Link>
                        {registration.status === 1 ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant='outline'
                                size='sm'>
                                取消报名
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认取消报名</AlertDialogTitle>
                                <AlertDialogDescription>
                                  您确定要取消报名这个活动吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    onCancelRegistration(
                                      registration.userId,
                                      registration.activityId,
                                    )
                                  }
                                >
                                  确认
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <div className='text-sm text-muted-foreground'>
                            {(() => {
                              switch (registration.status) {
                                case 2:
                                  return '已通过审核，无法取消';
                                case 3:
                                  return '已被拒绝';
                                case 0:
                                  return '已取消报名';
                                case 4:
                                  return '在候补名单中';
                                case 5:
                                  return '已参加活动';
                                case 6:
                                  return '未出席活动';
                                default:
                                  return '';
                              }
                            })()}
                          </div>
                        )}
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
