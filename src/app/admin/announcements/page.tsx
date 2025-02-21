'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAnnouncementList } from '@/hooks/use-announcement';
import type { Announcement } from '@/types/announcement.types';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAnnouncementList({
    page,
    pageSize: 10
  });

  return (
    <div>
      <div className='mb-8'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>公告列表</h2>
          <p className='text-muted-foreground'>
            查看系统公告
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部公告</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!data?.data?.announcements || data.data?.announcements.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5}
                      className='text-center'>
                      暂无公告
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data?.announcements.map((announcement: Announcement) => (
                    <TableRow
                      key={announcement.id}
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => router.push(`/admin/announcements/${announcement.id}`)}
                    >
                      <TableCell>{announcement.title}</TableCell>
                      <TableCell className='max-w-md truncate'>
                        {announcement.content}
                      </TableCell>
                      <TableCell>
                        {new Date(announcement.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${announcement.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {announcement.isPublished ? '已发布' : '未发布'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
