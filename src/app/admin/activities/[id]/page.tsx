'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { get, put } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentRegistrations: number;
  status: number;
  categoryId?: number;
  organizerId?: number;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Activity | null>(null);

  const fetchActivity = async () => {
    try {
      const response = await get(`/api/activities/${params.id}`);
      if (response.code === APIStatusCode.OK) {
        const activityData = response.data;
        setActivity(activityData);
        setFormData({
          ...activityData,
          startTime: new Date(activityData.startTime).toISOString().slice(0, 16),
          endTime: new Date(activityData.endTime).toISOString().slice(0, 16),
        });
      } else {
        console.error('获取活动详情失败:', response.message);
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({
      ...prev,
      [name]: value
    }) : null);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        capacity: parseInt(String(formData.capacity), 10),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      console.log('活动ID:', params.id, typeof params.id);
      console.log('更新数据:', updateData);
      console.log('更新数据类型:');
      Object.entries(updateData).forEach(([key, value]) => {
        console.log(`${key}:`, value, typeof value);
      });

      const response = await put(`/api/activities/${params.id}`, updateData);

      if (response.code === APIStatusCode.OK) {
        toast.success('活动更新成功！');
        setActivity(formData);
        setIsEditing(false);
      } else {
        console.error('更新失败响应:', response);
        toast.error(response.message || '更新失败，请重试');
      }
    } catch (error: any) {
      console.error('更新错误详情:', error);
      toast.error(error.message || '更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='text-center py-8'>加载中...</div>;
  }

  if (!activity || !formData) {
    return <div className='text-center py-8'>未找到活动</div>;
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>活动详情</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              修改活动
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动标题</h3>
              {isEditing ? (
                <Input
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder='请输入活动标题'
                />
              ) : (
                <p>{activity.title}</p>
              )}
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动分类</h3>
              <p>分类 {activity.categoryId || '未分类'}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>活动地点</h3>
              {isEditing ? (
                <Input
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder='请输入活动地点'
                />
              ) : (
                <p>{activity.location}</p>
              )}
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>人数限制</h3>
              {isEditing ? (
                <Input
                  type='number'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder='请输入人数限制'
                  min='1'
                />
              ) : (
                <p>{activity.currentRegistrations}/{activity.capacity}</p>
              )}
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>开始时间</h3>
              {isEditing ? (
                <Input
                  type='datetime-local'
                  name='startTime'
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{new Date(activity.startTime).toLocaleString()}</p>
              )}
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium text-muted-foreground'>结束时间</h3>
              {isEditing ? (
                <Input
                  type='datetime-local'
                  name='endTime'
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{new Date(activity.endTime).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            <h3 className='font-medium text-muted-foreground'>活动描述</h3>
            {isEditing ? (
              <Textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='请输入活动描述'
                rows={4}
              />
            ) : (
              <p className='whitespace-pre-wrap'>{activity.description}</p>
            )}
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className='flex justify-end space-x-4'>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditing(false);
                setFormData(activity);
              }}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 
