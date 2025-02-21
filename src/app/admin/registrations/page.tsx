'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useRegistrationList } from '@/hooks/use-registration';
import { RegistrationStatus } from '@/types/registration.types';

const statusMap = {
  [RegistrationStatus.CANCELLED]: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  [RegistrationStatus.PENDING]: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  [RegistrationStatus.APPROVED]: { label: '已批准', color: 'bg-green-100 text-green-800' },
  [RegistrationStatus.REJECTED]: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
  [RegistrationStatus.WAITLIST]: { label: '候补名单', color: 'bg-blue-100 text-blue-800' },
  [RegistrationStatus.ATTENDED]: { label: '已参加', color: 'bg-purple-100 text-purple-800' },
  [RegistrationStatus.ABSENT]: { label: '未出席', color: 'bg-orange-100 text-orange-800' }
};

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useRegistrationList({
    page,
    pageSize
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  const registrations = data?.data?.registrations || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>报名管理</h1>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>活动</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>报名时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}
                  className='text-center'>
                  暂无报名记录
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{registration.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{registration.userName}</div>
                      <div className='text-sm text-gray-500'>{registration.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{registration.activityTitle}</div>
                      <div className='text-sm text-gray-500'>
                        {new Date(registration.activityStartTime).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusMap[registration.status].color}
                    >
                      {statusMap[registration.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(registration.registeredAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-center gap-2 mt-4'>
        <Button
          variant='outline'
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          上一页
        </Button>
        <Button
          variant='outline'
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
} 
