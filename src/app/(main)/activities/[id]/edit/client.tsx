'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Activity } from '@/types/activity.types';
import type { Category } from '@/schema/category.schema';

interface ActivityEditClientProps {
  activity: Activity;
  categories: Category[];
  updateAction: (
    activityId: number,
    organizerId: number,
    data: {
      title: string;
      description: string;
      startTime: Date;
      endTime: Date;
      location: string;
      capacity: number;
      categoryId: number;
    },
  ) => Promise<void>;
}

export function ActivityEditClient({
  activity,
  categories,
  updateAction,
}: ActivityEditClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title,
    description: activity.description,
    startTime: new Date(activity.startTime).toISOString().slice(0, 16),
    endTime: new Date(activity.endTime).toISOString().slice(0, 16),
    location: activity.location,
    capacity: activity.capacity,
    categoryId: activity.categoryId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      await updateAction(activity.id, activity.organizerId, {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        capacity: Number(formData.capacity),
        categoryId: Number(formData.categoryId),
      });
      toast.success('活动更新成功');
      router.push(`/activities/${activity.id}`);
      router.refresh();
    } catch (error) {
      toast.error('更新失败', {
        description:
          error instanceof Error ? error.message : '请检查表单内容是否正确',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>编辑活动</h1>
        <Button variant='outline'
          onClick={() => router.back()}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活动信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}
            className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>
                活动标题
                <span className='text-red-500 ml-1'>*</span>
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='请输入活动标题'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>
                活动描述
                <span className='text-red-500 ml-1'>*</span>
              </Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='请输入活动描述'
                rows={6}
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>
                  开始时间
                  <span className='text-red-500 ml-1'>*</span>
                </Label>
                <Input
                  id='startTime'
                  type='datetime-local'
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='endTime'>
                  结束时间
                  <span className='text-red-500 ml-1'>*</span>
                </Label>
                <Input
                  id='endTime'
                  type='datetime-local'
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='location'>
                  活动地点
                  <span className='text-red-500 ml-1'>*</span>
                </Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder='请输入活动地点'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='capacity'>
                  人数限制
                  <span className='text-red-500 ml-1'>*</span>
                </Label>
                <Input
                  id='capacity'
                  type='number'
                  min={1}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>
                活动分类
                <span className='text-red-500 ml-1'>*</span>
              </Label>
              <Select
                value={String(formData.categoryId)}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='请选择活动分类' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id}
                      value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex justify-end gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isPending}
              >
                取消
              </Button>
              <Button type='submit'
                disabled={isPending}>
                {isPending ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

