'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';

interface CommentsClientProps {
	comments: Comment[];
}

export function CommentsClient({ comments }: CommentsClientProps) {
	const router = useRouter();

	return (
  <div className='container mx-auto py-12'>
    <div className='flex justify-between items-center mb-8'>
      <h1 className='text-3xl font-bold'>社区留言</h1>
      <Button onClick={() => router.push('/comments/create')}>
        发表留言
      </Button>
    </div>

    {!comments || comments.length === 0 ? (
      <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
        <MessageSquare className='h-12 w-12 mb-4' />
        <p>暂无留言</p>
      </div>
			) : (
  <div className='space-y-6'>
    {comments.map((comment) => (
      <div
        key={comment.id}
        className='group border-b border-border pb-6 hover:bg-muted/50 transition-colors rounded-lg p-4'
						>
        <div className='flex justify-between items-start mb-2'>
          <h2 className='text-xl font-semibold group-hover:text-primary transition-colors'>
            {comment.title}
          </h2>
          <span className='text-sm text-muted-foreground'>
            {new Date(comment.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
        <p className='text-muted-foreground whitespace-pre-wrap mb-4'>
          {comment.content}
        </p>
        <div className='text-sm text-muted-foreground'>
          用户 ID: {comment.userId}
        </div>
      </div>
					))}
  </div>
			)}
  </div>
	);
}
