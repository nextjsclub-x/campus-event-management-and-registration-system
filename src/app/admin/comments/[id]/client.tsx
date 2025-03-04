'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Comment } from '@/schema/comment.schema';
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
import { useState } from 'react';

const CommentStatusMap = {
  0: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '已通过', className: 'bg-green-100 text-green-800' },
  2: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
  3: { label: '已撤回', className: 'bg-gray-100 text-gray-800' },
};

interface CommentClientProps {
  comment: Comment;
  onUpdateStatus: (commentId: number, status: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
}

export function CommentClient({
  comment,
  onUpdateStatus,
  onDelete,
}: CommentClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleUpdateStatus = async (status: number) => {
    try {
      setIsPending(true);
      await onUpdateStatus(comment.id, status);
      if (status === 2) {
        // 如果是驳回，返回列表
        router.push('/admin/comments');
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsPending(true);
      await onDelete(comment.id);
      router.push('/admin/comments');
    } finally {
      setIsPending(false);
    }
  };

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
            <p className='text-muted-foreground'>查看和管理留言信息</p>
          </div>
          <div className='space-x-4'>
            {comment.status !== 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='default'
                    disabled={isPending}>
                    通过
                  </Button>
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
                  <Button variant='destructive'
                    disabled={isPending}>
                    驳回
                  </Button>
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
                <Button variant='destructive'
                  disabled={isPending}>
                  删除
                </Button>
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
            className={
              CommentStatusMap[comment.status as keyof typeof CommentStatusMap]
                ?.className
            }
          >
            {
              CommentStatusMap[comment.status as keyof typeof CommentStatusMap]
                ?.label
            }
          </Badge>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>用户ID</p>
            <p>{comment.userId}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>
              创建时间
            </p>
            <p>{new Date(comment.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

