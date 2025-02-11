'use client';

import { useEffect, useState } from 'react';
import { get } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '@/schema/announcement.schema';
import { useToast } from '@/hooks/use-toast';
import type { APIResponse } from '@/schema/api-response.schema';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AnnouncementListResponse {
  announcements: Announcement[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnnouncementListResponse>({
    announcements: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await get('/api/announcements?isPublished=1');
        const apiResponse = response as APIResponse<AnnouncementListResponse>;
        if (apiResponse?.data?.announcements) {
          setData(apiResponse.data);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: '获取公告列表失败',
          description: error.message || '请稍后重试',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [toast]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-12'>
      <h1 className='text-3xl font-bold mb-8'>系统公告</h1>

      {(!data?.announcements || data.announcements.length === 0) ? (
        <div className='text-center text-muted-foreground py-12'>
          暂无公告
        </div>
      ) : (
        <div className='space-y-6'>
          {data.announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={cn(
                'group border-b border-border pb-6 cursor-pointer',
                'hover:bg-muted/50 transition-colors rounded-lg p-4'
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
