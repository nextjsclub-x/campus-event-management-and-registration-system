'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateAnnouncement } from '@/hooks/use-announcement';
import type { CreateAnnouncementParams } from '@/types/announcement.types';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();
  const [formData, setFormData] = useState<CreateAnnouncementParams>({
    title: '',
    content: '',
    isPublished: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    createAnnouncement(formData, {
      onSuccess: () => {
        router.push('/admin/announcements');
      }
    });
  };

  return (
    <div>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>创建公告</h2>
        <p className='text-muted-foreground'>
          创建新的系统公告
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
                checked={formData.isPublished === 1}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isPublished: checked ? 1 : 0
                }))}
              />
              <Label htmlFor='isPublished'>立即发布</Label>
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
              <Button
                type='submit'
                disabled={isPending}
              >
                {isPending ? '创建中...' : '创建公告'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

