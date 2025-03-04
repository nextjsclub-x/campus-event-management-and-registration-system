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
import type { Announcement } from '@/types/announcement.types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface AnnouncementsClientProps {
  initialData: {
    items: Announcement[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  currentPage: number;
}

export function AnnouncementsClient({
  initialData,
  currentPage,
}: AnnouncementsClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(currentPage);

  const announcements = initialData.items;
  const { totalPages, total } = initialData;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/admin/announcements?page=${newPage}`);
    router.refresh();
  };

  return (
    <div>
      <div className='mb-8'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>公告列表</h2>
          <p className='text-muted-foreground'>查看系统公告</p>
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>全部公告</CardTitle>
          <div className='text-sm text-muted-foreground'>共 {total} 条记录</div>
        </CardHeader>
        <CardContent>
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
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}
                    className='text-center'>
                    暂无公告
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement: Announcement) => (
                  <TableRow
                    key={announcement.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() =>
                      router.push(`/admin/announcements/${announcement.id}`)
                    }
                  >
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell className='max-w-md truncate'>
                      {announcement.content}
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${announcement.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {announcement.isPublished ? '已发布' : '未发布'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant='ghost'
                        size='sm'>
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {(announcements?.length ?? 0) > 0 && (
            <div className='mt-4 flex flex-col items-center gap-2'>
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(page - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => handlePageChange(p)}
                          isActive={page === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
              <div className='text-sm text-muted-foreground'>
                第 {page} 页，共 {totalPages} 页
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

