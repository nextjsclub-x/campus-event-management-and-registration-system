'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { get, del } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '@/schema/announcement.schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { APIResponse } from '@/schema/api-response.schema';

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
        router.push('/admin/announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [params.id, router, toast]);

  const handleDelete = async () => {
    try {
      await del(`/api/announcements/${params.id}`);
      toast({
        title: '删除成功',
        description: '公告已删除'
      });
      router.push('/admin/announcements');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error.message || '请稍后重试'
      });
    }
  };

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
    <div>
      <div className='mb-8'>
        <div className='flex justify-between items-start'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-bold'>公告详情</h2>
            <p className='text-muted-foreground'>
              查看和管理公告信息
            </p>
          </div>
          <div className='space-x-4'>
            <Button
              variant='outline'
              onClick={() => router.push(`/admin/announcements/${params.id}/edit`)}
            >
              编辑
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>删除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除该公告，删除后无法恢复。确定要继续吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>公告信息</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>标题</p>
            <p>{announcement.title}</p>
          </div>

          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>内容</p>
            <p className='whitespace-pre-wrap'>{announcement.content}</p>
          </div>

          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>发布状态</p>
            <p>
              <span className={`px-2 py-1 rounded-full text-xs ${
                announcement.isPublished 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {announcement.isPublished ? '已发布' : '未发布'}
              </span>
            </p>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>创建时间</p>
              <p>{new Date(announcement.createdAt).toLocaleString('zh-CN')}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>更新时间</p>
              <p>{new Date(announcement.updatedAt).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
