'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/schema/announcement.schema';

interface AnnouncementsClientProps {
	announcements: Announcement[];
}

export function AnnouncementsClient({
	announcements,
}: AnnouncementsClientProps) {
	const router = useRouter();

	if (!announcements || announcements.length === 0) {
		return (
  <div className='text-center text-muted-foreground py-12'>暂无公告</div>
		);
	}

	return (
  <div className='space-y-6'>
    {announcements.map((announcement) => (
      <button
        type='button'
        key={announcement.id}
        className={cn(
						'group border-b border-border pb-6 w-full text-left',
						'hover:bg-muted/50 transition-colors rounded-lg p-4',
					)}
        onClick={() => router.push(`/announcements/${announcement.id}`)}
				>
        <div className='space-y-2'>
          <div className='flex items-start justify-between'>
            <h2 className='text-xl font-semibold group-hover:text-primary transition-colors'>
              {announcement.title}
            </h2>
            <time className='text-sm text-muted-foreground'>
              {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
            </time>
          </div>

          <p className='text-muted-foreground line-clamp-2 text-sm'>
            {announcement.content}
          </p>

          <div className='flex items-center gap-4 text-sm'>
            <span className='text-muted-foreground'>
              {/* 可以添加其他元信息，如阅读量等 */}
            </span>
          </div>
        </div>
      </button>
			))}
  </div>
	);
}
