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
import { useUserStore } from '@/store/user';

// 定义表单数据的接口
interface ActivityFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: string;
  categoryId: string;
}

const CreateActivityPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { token, userId } = useUserStore();
  
  // 创建默认的开始时间（当前时间）和结束时间（24小时后）
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  // 格式化时间为 datetime-local 输入框所需的格式 (YYYY-MM-DDThh:mm)
  const formatDateForInput = (date: Date) => date.toISOString().slice(0, 16);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    startTime: formatDateForInput(now),      // 设置默认开始时间
    endTime: formatDateForInput(tomorrow),    // 设置默认结束时间
    location: '',
    capacity: '10',                          // 设置默认活动容量为10
    categoryId: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!userId) {
        throw new Error('请先登录');
      }

      // 验证表单
      if (!formData.title.trim() || !formData.description.trim() || 
          !formData.startTime || !formData.endTime || 
          !formData.location.trim() || !formData.capacity || 
          !formData.categoryId) {
        throw new Error('请填写所有必填项');
      }

      // 发送创建请求，添加类型
      interface CreateActivityRequest {
        organizerId: number;
        title: string;
        description: string;
        startTime: string;
        endTime: string;
        location: string;
        capacity: number;
        categoryId: number;
      }

      const requestData: CreateActivityRequest = {
        ...formData,
        organizerId: userId,
        capacity: parseInt(formData.capacity, 10),
        categoryId: parseInt(formData.categoryId, 10)
      };

      await post('/api/activity/create', requestData);

      toast({
        title: '创建成功',
        description: '活动已创建'
      });

      router.push('/activities');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: error.message || '请稍后重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>创建活动</h2>
        <p className='text-muted-foreground mt-2'>
          创建一个新的活动
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活动信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}
            className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>活动标题</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder='请输入活动标题'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>活动描述</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder='请输入活动描述'
                rows={6}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>开始时间</Label>
                <Input
                  id='startTime'
                  type='datetime-local'
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    startTime: e.target.value
                  }))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='endTime'>结束时间</Label>
                <Input
                  id='endTime'
                  type='datetime-local'
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endTime: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>活动地点</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
                placeholder='请输入活动地点'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>活动容量</Label>
                <Input
                  id='capacity'
                  type='number'
                  min='1'
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    capacity: e.target.value
                  }))}
                  placeholder='请输入活动容量'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='categoryId'>活动类别</Label>
                <Input
                  id='categoryId'
                  type='number'
                  min='1'
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    categoryId: e.target.value
                  }))}
                  placeholder='请选择活动类别'
                />
              </div>
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
                {submitting ? '创建中...' : '创建活动'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateActivityPage; 
