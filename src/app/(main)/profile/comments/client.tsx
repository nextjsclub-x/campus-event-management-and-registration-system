'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Trash2 } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';
import { useEffect, useState } from 'react';
import { getUserById } from '@/models/user/get-user-by-id';
import { deleteComment } from '@/models/comment/delete-comment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CommentStatusMap = {
  0: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '已通过', className: 'bg-green-100 text-green-800' },
  2: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
  3: { label: '已撤回', className: 'bg-gray-100 text-gray-800' },
};

interface CommentsClientProps {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
  userId: number;
}

export function CommentsClient({ comments, pagination, userId }: CommentsClientProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = await getUserById(userId);
        if (user) {
          setUsername(user.name);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUsername();
  }, [userId]);

  const handleDelete = async () => {
    if (!selectedCommentId) return;

    try {
      setIsDeleting(true);
      await deleteComment(selectedCommentId);
      router.refresh(); // 刷新页面数据
    } catch (error) {
      console.error('删除评论失败:', error);
    } finally {
      setIsDeleting(false);
      setSelectedCommentId(null);
    }
  };

  return (
    <>
      <div className='space-y-6'>
        {!comments || comments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
            <MessageSquare className='h-12 w-12 mb-4' />
            <p>暂无留言</p>
            <Button 
              variant='outline' 
              className='mt-4'
              onClick={() => router.push('/comments/create')}
            >
              发表留言
            </Button>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
              <User className='h-4 w-4' />
              <span>发布者：{username || '加载中...'}</span>
            </div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className='group border rounded-lg p-6 hover:bg-muted/50 transition-colors'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h2 className='text-xl font-semibold group-hover:text-primary transition-colors'>
                      {comment.title}
                    </h2>
                    <div className='flex items-center gap-3 mt-2'>
                      <Badge
                        variant='secondary'
                        className={
                          CommentStatusMap[
                            comment.status as keyof typeof CommentStatusMap
                          ]?.className
                        }
                      >
                        {
                          CommentStatusMap[
                            comment.status as keyof typeof CommentStatusMap
                          ]?.label
                        }
                      </Badge>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-red-500 hover:text-red-700'
                        onClick={() => setSelectedCommentId(comment.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {new Date(comment.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className='text-muted-foreground whitespace-pre-wrap'>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!selectedCommentId}
        onOpenChange={() => setSelectedCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条留言吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-500 hover:bg-red-600'
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}