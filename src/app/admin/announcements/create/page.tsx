'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { post } from '@/utils/request/request';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublished: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('标题和内容不能为空');
      }

      await post('/api/announcements', {
        ...formData,
        isPublished: formData.isPublished ? 1 : 0
      });

      toast({
        title: '创建成功',
        description: '公告已创建'
      });

      router.push('/admin/announcements');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
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
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isPublished: checked
                }))}
              />
              <Label htmlFor='isPublished'>立即发布</Label>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type='submit'
                disabled={loading}
              >
                {loading ? '创建中...' : '创建公告'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 

