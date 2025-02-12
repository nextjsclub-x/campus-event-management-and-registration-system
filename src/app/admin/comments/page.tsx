'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { get, del } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';
import type { APIResponse } from '@/schema/api-response.schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'
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
} from '@/components/ui/alert-dialog'

interface CommentListResponse {
  comments: Comment[];
  total: number;
}

const CommentStatusMap = {
  0: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '已通过', className: 'bg-green-100 text-green-800' },
  2: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
  3: { label: '已撤回', className: 'bg-gray-100 text-gray-800' },
};

export default function CommentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommentListResponse>({
    comments: [],
    total: 0
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchComments = async () => {
    try {
      const response = await get(`/api/comments?page=${page}&pageSize=${pageSize}`);
      const apiResponse = response as APIResponse<CommentListResponse>;
      if (apiResponse?.data) {
        setData(apiResponse.data);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '获取评论列表失败',
        description: error.message || '请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [page]);

  const totalPages = Math.ceil(data.total / pageSize);

  const handleDelete = async (id: number) => {
    try {
      await del(`/api/comments/${id}`);
      toast({
        title: '删除成功',
        description: '评论已删除'
      });
      fetchComments(); // 重新加载列表
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请稍后重试'
      });
    }
  };

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

      {loading ? (
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
              {(!data.comments || data.comments.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7}
                    className='text-center'>
                    暂无评论
                  </TableCell>
                </TableRow>
              ) : (
                data.comments.map((comment) => (
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
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant='destructive'
                              size='sm'
                            >
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除这条评论吗？此操作不可恢复。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(comment.id)}>
                                确认删除
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

          {data.comments.length > 0 && (
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
                  
                  {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
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
