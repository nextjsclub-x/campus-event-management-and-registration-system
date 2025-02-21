'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { useCommentList } from '@/hooks/use-comment';
import { CommentStatusType } from '@/types/comment.types';

interface Comment {
  id: number;
  title: string;
  content: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: number;
}

export default function CommentsPage() {
  const router = useRouter();

  const { data: response, isLoading } = useCommentList({
    filters: {
      status: CommentStatusType.APPROVED, // 只获取已通过的评论
    },
    pagination: {
      limit: 50, // 一次性获取较多评论
      sortBy: 'createdAt',
      order: 'desc'
    }
  });

  const comments = (response?.data || []) as Comment[];

  return (
    <div className='container mx-auto py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>社区留言</h1>
        <Button onClick={() => router.push('/comments/create')}>
          发表留言
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <div className='space-y-6'>
          {(!comments || comments.length === 0) ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>暂无留言</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <CardTitle>{comment.title}</CardTitle>
                    <span className='text-sm text-muted-foreground'>
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='whitespace-pre-wrap'>{comment.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
