'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { get, put } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '@/schema/announcement.schema';
import type { APIResponse } from '@/schema/api-response.schema';

export default function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublished: false
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await get(`/api/announcements/${params.id}`);
        console.log('API Response:', response); // 调试用
        const apiResponse = response as APIResponse<Announcement>;
        
        if (apiResponse?.data) {
          const announcement = apiResponse.data;
          console.log('Setting form data:', announcement); // 调试用
          setFormData({
            title: announcement.title || '',
            content: announcement.content || '',
            isPublished: Boolean(announcement.isPublished)
          });
        } else {
          throw new Error('无效的公告数据');
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('标题和内容不能为空');
      }

      await put(`/api/announcements/${params.id}`, {
        ...formData,
        isPublished: formData.isPublished ? 1 : 0
      });

      toast({
        title: '更新成功',
        description: '公告已更新'
      });

      router.push('/admin/announcements');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>编辑公告</h2>
        <p className='text-muted-foreground'>
          修改公告信息
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>公告信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}
            className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>标题</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder='请输入公告标题'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='content'>内容</Label>
              <Textarea
                id='content'
                value={formData.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: e.target.value
                }))}
                placeholder='请输入公告内容'
                rows={6}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='isPublished'
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isPublished: checked
                }))}
              />
              <Label htmlFor='isPublished'>发布状态</Label>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                type='submit'
                disabled={submitting}
              >
                {submitting ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
