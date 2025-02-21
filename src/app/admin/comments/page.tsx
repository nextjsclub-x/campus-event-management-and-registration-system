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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { useCommentList } from '@/hooks/use-comment';
import { CommentStatusType } from '@/types/comment.types';

const CommentStatusMap = {
  0: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '已通过', className: 'bg-green-100 text-green-800' },
  2: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
  3: { label: '已撤回', className: 'bg-gray-100 text-gray-800' },
};

export default function CommentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading } = useCommentList({
    filters: {
      status: CommentStatusType.APPROVED,
    },
    pagination: {
      limit: pageSize,
      sortBy: 'createdAt',
      order: 'desc'
    }
  });

  const comments = response?.data || [];
  const totalPages = Math.ceil(comments.length / pageSize);

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>社区留言管理</h2>
          <p className='text-muted-foreground'>
            查看和管理社区留言
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>用户ID</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!comments || comments.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7}
                    className='text-center'>
                    暂无评论
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment: Comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>{comment.id}</TableCell>
                    <TableCell>{comment.title}</TableCell>
                    <TableCell className='max-w-md truncate'>
                      {comment.content}
                    </TableCell>
                    <TableCell>{comment.userId}</TableCell>
                    <TableCell>
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='secondary'
                        className={CommentStatusMap[comment.status as keyof typeof CommentStatusMap]?.className}
                      >
                        {CommentStatusMap[comment.status as keyof typeof CommentStatusMap]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => router.push(`/admin/comments/${comment.id}`)}
                        >
                          查看
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {(comments?.length ?? 0) > 0 && (
            <div className='mt-4 flex justify-center'>
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
