'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { get } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '@/schema/announcement.schema';
import type { APIResponse } from '@/schema/api-response.schema';
import { useToast } from '@/hooks/use-toast';

export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await get(`/api/announcements/${params.id}`);
        const apiResponse = response as APIResponse<Announcement>;
        setAnnouncement(apiResponse.data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: '获取公告详情失败',
          description: error.message || '请稍后重试',
        });
        router.push('/announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!announcement) {
    return null;
  }

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
        <h1 className='text-4xl font-bold mb-6'>
          {announcement.title}
        </h1>

        <div className='flex items-center gap-4 text-sm text-muted-foreground mb-8'>
          <div>
            发布时间：{new Date(announcement.createdAt).toLocaleString('zh-CN')}
          </div>
          {announcement.updatedAt !== announcement.createdAt && (
            <div>
              更新时间：{new Date(announcement.updatedAt).toLocaleString('zh-CN')}
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
