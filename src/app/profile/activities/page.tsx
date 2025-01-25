'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function MyActivitiesPage() {
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
              <TableRow>
                <TableCell>示例活动</TableCell>
                <TableCell>2024-01-01 14:00</TableCell>
                <TableCell>进行中</TableCell>
                <TableCell>10/50</TableCell>
                <TableCell>
                  <div className='space-x-2'>
                    <Button variant='outline'
                      size='sm'>查看
                    </Button>
                    <Button variant='outline'
                      size='sm'>编辑
                    </Button>
                    <Button variant='outline'
                      size='sm'>审核报名
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
