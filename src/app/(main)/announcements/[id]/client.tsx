'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Announcement } from '@/schema/announcement.schema';

interface AnnouncementClientProps {
	announcement: Announcement;
}

export function AnnouncementClient({ announcement }: AnnouncementClientProps) {
	const router = useRouter();

	return (
  <div className='container mx-auto py-12'>
    <div className='mb-6'>
      <Button
        variant='outline'
        onClick={() => router.back()}
        className='mb-8'
				>
        返回
      </Button>
    </div>

    <article className='prose prose-lg max-w-none'>
      <h1 className='text-4xl font-bold mb-6'>{announcement.title}</h1>

      <div className='flex items-center gap-4 text-sm text-muted-foreground mb-8'>
        <div>
          发布时间：{new Date(announcement.createdAt).toLocaleString('zh-CN')}
        </div>
        {announcement.updatedAt !== announcement.createdAt && (
        <div>
          更新时间：
          {new Date(announcement.updatedAt).toLocaleString('zh-CN')}
        </div>
					)}
      </div>

      <div className='my-8 border-t border-b border-border py-8'>
        <div className='whitespace-pre-wrap leading-relaxed text-lg'>
          {announcement.content}
        </div>
      </div>

      <div className='text-sm text-muted-foreground mt-8'>
        {/* 可以添加其他元信息，比如阅读量等 */}
      </div>
    </article>
  </div>
	);
}
