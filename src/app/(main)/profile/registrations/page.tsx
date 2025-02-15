'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MyRegistrationsPage() {
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
              <TableRow>
                <TableCell>示例活动</TableCell>
                <TableCell>2024-01-01 14:00</TableCell>
                <TableCell>已通过</TableCell>
                <TableCell>
                  <div className='space-x-2'>
                    <Button variant='outline'
                      size='sm'>查看详情
                    </Button>
                    <Button variant='outline'
                      size='sm'>取消报名
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
