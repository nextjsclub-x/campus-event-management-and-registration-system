'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserStore } from '@/store/user';
import { useUserRegistrations, useCancelRegistration } from '@/hooks/use-registration';
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

export default function MyRegistrationsPage() {
  const userId = Number(useUserStore((state) => state.id));
  const { data, isLoading } = useUserRegistrations(userId);
  const { mutate: cancelRegistration } = useCancelRegistration();

  if (isLoading) {
    return (
      <div className='container mx-auto py-6 space-y-6'>
        <h1 className='text-2xl font-bold'>我的报名</h1>
        <Card>
          <CardHeader>
            <CardTitle>已报名的活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div>加载中...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registrations = data?.data?.registrations || [];

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
                    className='text-center'>暂无报名记录
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>{registration.activityTitle}</TableCell>
                    <TableCell>{registration.activityStartTime ? format(new Date(registration.activityStartTime), 'yyyy-MM-dd HH:mm') : '未设置'}</TableCell>
                    <TableCell>{registration.statusText}</TableCell>
                    <TableCell>
                      <div className='space-x-2'>
                        <Link href={`/activities/${registration.activityId}`}>
                          <Button variant='outline'
                            size='sm'>
                            查看详情
                          </Button>
                        </Link>
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
                              <AlertDialogAction onClick={() => cancelRegistration(registration.id)}>
                                确认
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
