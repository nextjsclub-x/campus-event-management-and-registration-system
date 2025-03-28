'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';

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
}

export function CommentsClient({ comments, pagination }: CommentsClientProps) {
  const router = useRouter();

  return (
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
                  <div className='mt-2'>
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
  );
}