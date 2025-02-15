'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { get } from '@/utils/request/request';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Comment } from '@/schema/comment.schema';
import type { APIResponse } from '@/schema/api-response.schema';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user';

interface CommentListResponse {
  comments: Comment[];
  total: number;
}

export default function CommentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommentListResponse>({
    comments: [],
    total: 0
  });

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // 只获取状态为已通过的评论
        const response = await get('/api/comments?status=1');
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

    fetchComments();
  }, [toast]);

  return (
    <div className='container mx-auto py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>社区留言</h1>
        {token && (
          <Button onClick={() => router.push('/comments/create')}>
            发表留言
          </Button>
        )}
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <div className='space-y-6'>
          {(!data.comments || data.comments.length === 0) ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>暂无留言</p>
              </CardContent>
            </Card>
          ) : (
            data.comments.map((comment) => (
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
