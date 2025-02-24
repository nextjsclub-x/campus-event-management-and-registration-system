'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActivityRegistrations, useApproveRegistration, useRejectRegistration } from '@/hooks/use-registration';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RegistrationStatus } from '@/types/registration.types';

const registrationStatusMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  [RegistrationStatus.PENDING]: { label: '待审核', variant: 'secondary' },
  [RegistrationStatus.APPROVED]: { label: '已通过', variant: 'default' },
  [RegistrationStatus.REJECTED]: { label: '已拒绝', variant: 'destructive' },
  [RegistrationStatus.CANCELLED]: { label: '已取消', variant: 'destructive' },
};

export default function ActivityRegistrationsPage() {
  const params = useParams();
  const activityId = Number(params.id);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<number | undefined>();

  const { data, isLoading } = useActivityRegistrations(activityId, {
    page,
    pageSize: 10,
  });

  const { mutate: approveRegistration } = useApproveRegistration();
  const { mutate: rejectRegistration } = useRejectRegistration();

  const handleApprove = (registrationId: number) => {
    approveRegistration(registrationId);
  };

  const handleReject = (registrationId: number) => {
    rejectRegistration(registrationId);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!data?.data?.registrations?.length) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            className='text-center py-10 text-muted-foreground'
          >
            暂无报名记录
          </TableCell>
        </TableRow>
      );
    }

    return data.data.registrations.map((registration) => (
      <TableRow key={registration.id}>
        <TableCell>{registration.userName}</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
        <TableCell>
          {format(new Date(registration.registeredAt), 'yyyy-MM-dd HH:mm')}
        </TableCell>
        <TableCell>
          <Badge variant={registrationStatusMap[registration.status].variant}>
            {registrationStatusMap[registration.status].label}
          </Badge>
        </TableCell>
        <TableCell>
          <div className='space-x-2'>
            {registration.status === RegistrationStatus.PENDING && (
              <>
                <Button
                  variant='default'
                  size='sm'
                  onClick={() => handleApprove(registration.id)}
                >
                  通过
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleReject(registration.id)}
                >
                  拒绝
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>报名管理</h1>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>报名列表</CardTitle>
            <Select
              value={status?.toString() || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? undefined : Number(value))}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='全部状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部状态</SelectItem>
                {Object.entries(registrationStatusMap).map(([value, { label }]) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>报名时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
