'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateComment } from '@/hooks/use-comment';
import { useUserStore } from '@/store/user';
import type { CreateCommentData } from '@/types/comment.types';

export default function CreateCommentPage() {
  const router = useRouter();
  const { id } = useUserStore();
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    const form = e.currentTarget;
    const title = (
      form.elements.namedItem('title') as HTMLInputElement
    ).value.trim();
    const content = (
      form.elements.namedItem('content') as HTMLTextAreaElement
    ).value.trim();

    if (!title || !content) return;

    const data: CreateCommentData = {
      userId: Number.parseInt(id, 10),
      title,
      content,
    };

    createComment(data, {
      onSuccess: () => router.push('/comments'),
    });
  };

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>发表留言</h2>
        <p className='text-muted-foreground mt-2'>分享你的想法和建议</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>留言内容</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}
            className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>标题</Label>
              <Input
                id='title'
                name='title'
                placeholder='请输入标题'
                disabled={isPending}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='content'>内容</Label>
              <Textarea
                id='content'
                name='content'
                placeholder='请输入内容'
                rows={6}
                disabled={isPending}
                required
              />
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isPending}
              >
                取消
              </Button>
              <Button type='submit'
                disabled={isPending || !id}>
                {isPending ? '提交中...' : '提交留言'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
