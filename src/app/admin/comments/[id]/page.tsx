'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { get, patch, del } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';
import type { APIResponse } from '@/schema/api-response.schema';
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
import { Badge } from '@/components/ui/badge';

const CommentStatusMap = {
  0: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '已通过', className: 'bg-green-100 text-green-800' },
  2: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
  3: { label: '已撤回', className: 'bg-gray-100 text-gray-800' },
};

export default function CommentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState<Comment | null>(null);

  useEffect(() => {
    const fetchComment = async () => {
      try {
        const response = await get(`/api/comments/${params.id}`);
        const apiResponse = response as APIResponse<Comment>;
        setComment(apiResponse.data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: '获取评论详情失败',
          description: error.message || '请稍后重试',
        });
        router.push('/admin/comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComment();
  }, [params.id, router, toast]);

  const handleUpdateStatus = async (status: number) => {
    try {
      const response = await patch(`/api/comments/${params.id}`, { status });
      const apiResponse = response as APIResponse<Comment>;
      setComment(apiResponse.data);
      toast({
        title: '更新成功',
        description: status === 1 ? '留言已通过' : '留言已驳回'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await del(`/api/comments/${params.id}`);
      toast({
        title: '删除成功',
        description: '留言已删除'
      });
      router.push('/admin/comments');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请稍后重试'
      });
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!comment) {
    return null;
  }

  return (
    <div className='p-6'>
      <div className='mb-4'>
        <Button 
          variant='outline' 
          onClick={() => router.push('/admin/comments')}
        >
          返回列表
        </Button>
      </div>

      <div className='mb-8'>
        <div className='flex justify-between items-start'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-bold'>留言详情</h2>
            <p className='text-muted-foreground'>
              查看和管理留言信息
            </p>
          </div>
          <div className='space-x-4'>
            {comment.status !== 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='default'>通过</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认通过</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要通过这条留言吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleUpdateStatus(1)}>
                      确认通过
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {comment.status !== 2 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive'>驳回</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认驳回</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要驳回这条留言吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleUpdateStatus(2)}>
                      确认驳回
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>删除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除这条留言吗？此操作不可恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className='space-y-8'>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>标题</p>
          <p>{comment.title}</p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>内容</p>
          <p className='whitespace-pre-wrap'>{comment.content}</p>
        </div>

        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>状态</p>
          <Badge
            variant='secondary'
            className={CommentStatusMap[comment.status as keyof typeof CommentStatusMap]?.className}
          >
            {CommentStatusMap[comment.status as keyof typeof CommentStatusMap]?.label}
          </Badge>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>用户ID</p>
            <p>{comment.userId}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>创建时间</p>
            <p>{new Date(comment.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
