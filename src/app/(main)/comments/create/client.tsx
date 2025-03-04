'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface CreateCommentClientProps {
	createAction: (data: {
		title: string;
		content: string;
	}) => Promise<void>;
}

export function CreateCommentClient({
	createAction,
}: CreateCommentClientProps) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const title = (
			form.elements.namedItem('title') as HTMLInputElement
		).value.trim();
		const content = (
			form.elements.namedItem('content') as HTMLTextAreaElement
		).value.trim();

		if (!title || !content) return;

		setIsPending(true);
		try {
			await createAction({
				title,
				content,
			});
		} catch (error) {
			console.error('创建留言失败:', error);
		} finally {
			setIsPending(false);
		}
	};

	return (
  <div className='w-full mx-auto py-12'>
    <div className='mb-8'>
      <h2 className='text-3xl font-bold'>发表留言</h2>
      <p className='text-muted-foreground mt-2'>分享你的想法和建议</p>
    </div>

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
          disabled={isPending}>
          {isPending ? '提交中...' : '提交留言'}
        </Button>
      </div>
    </form>
  </div>
	);
}
