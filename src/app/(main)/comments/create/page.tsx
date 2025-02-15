'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { post } from '@/utils/request/request';
import { useToast } from '@/hooks/use-toast';

export default function CreateCommentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('标题和内容不能为空');
      }

      await post('/api/comments', formData);

      toast({
        title: '提交成功',
        description: '留言已提交，请等待审核'
      });

      router.push('/comments');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '提交失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>发表留言</h2>
        <p className='text-muted-foreground mt-2'>
          分享你的想法和建议
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>留言内容</CardTitle>
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
                placeholder='请输入标题'
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
                placeholder='请输入内容'
                rows={6}
              />
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
                {submitting ? '提交中...' : '提交留言'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
