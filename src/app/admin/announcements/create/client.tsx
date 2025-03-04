'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Announcement } from '@/models/announcement/utils';

interface CreateAnnouncementClientProps {
	createAction: (data: {
		title: string;
		content: string;
		isPublished: boolean;
	}) => Promise<Announcement>;
}

export function CreateAnnouncementClient({
	createAction,
}: CreateAnnouncementClientProps) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		isPublished: false,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsPending(true);
		try {
			await createAction(formData);
			router.push('/admin/announcements');
			router.refresh();
		} catch (error) {
			console.error('创建公告失败:', error);
		} finally {
			setIsPending(false);
		}
	};

	return (
  <main className='container mx-auto px-4 py-8'>
    <div className='flex justify-between items-center mb-8'>
      <h1 className='text-3xl font-bold'>新增公告</h1>
      <Button
        variant='outline'
        onClick={() => router.push('/admin/announcements')}
				>
        返回
      </Button>
    </div>

    <form onSubmit={handleSubmit}
      className='max-w-2xl space-y-6'>
      <div className='space-y-2'>
        <Label>
          标题
          <span className='text-red-500 ml-1'>*</span>
        </Label>
        <Input
          required
          value={formData.title}
          onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
          placeholder='请输入公告标题'
					/>
      </div>

      <div className='space-y-2'>
        <Label>
          内容
          <span className='text-red-500 ml-1'>*</span>
        </Label>
        <Textarea
          required
          value={formData.content}
          onChange={(e) =>
							setFormData({ ...formData, content: e.target.value })
						}
          placeholder='请输入公告内容'
          rows={8}
					/>
      </div>

      <div className='flex items-center space-x-2'>
        <Switch
          id='isPublished'
          checked={formData.isPublished}
          onCheckedChange={(checked) =>
							setFormData({ ...formData, isPublished: checked })
						}
					/>
        <Label htmlFor='isPublished'>立即发布</Label>
      </div>

      <div className='flex gap-4'>
        <Button type='submit'
          disabled={isPending}>
          {isPending ? '创建中...' : '创建公告'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/admin/announcements')}
					>
          取消
        </Button>
      </div>
    </form>
  </main>
	);
}
