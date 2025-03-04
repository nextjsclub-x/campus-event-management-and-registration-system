'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/schema/category.schema';

interface CreateActivityClientProps {
  categories: Category[];
  userId: number;
  createAction: (data: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location: string;
    capacity: number;
    categoryId: number;
  }) => Promise<void>;
}

export function CreateActivityClient({
  categories,
  userId,
  createAction,
}: CreateActivityClientProps) {
  const router = useRouter();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const formatDateForInput = (date: Date) => date.toISOString().slice(0, 16);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    capacity?: string;
    categoryId?: string;
  }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: (() => {
      // 开始时间设置为当前时间往后24小时
      const date = new Date();
      date.setHours(date.getHours() + 24);
      return formatDateForInput(date);
    })(),
    endTime: (() => {
      // 结束时间设置为当前时间往后一个月
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return formatDateForInput(date);
    })(),
    location: '',
    capacity: '30',
    categoryId: categories[0]?.id.toString() || '',
  });

  // 当分类列表加载完成且没有选择分类时，自动选择第一个分类
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({
        ...prev,
        categoryId: categories[0].id.toString(),
      }));
    }
  }, [categories, formData.categoryId]);

  // 验证单个字段
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'title': {
        return !value.trim() ? '请输入活动标题' : '';
      }
      case 'description': {
        return !value.trim() ? '请输入活动描述' : '';
      }
      case 'location': {
        return !value.trim() ? '请输入活动地点' : '';
      }
      case 'capacity': {
        if (!value) return '请输入活动容量';
        const capacityNum = Number(value);
        if (Number.isNaN(capacityNum) || capacityNum < 1) {
          return '活动容量必须大于0';
        }
        return '';
      }
      case 'categoryId': {
        return !value ? '请选择活动类别' : '';
      }
      case 'startTime': {
        if (!value) return '请选择开始时间';
        const startDate = new Date(value);
        const currentTime = new Date();
        return startDate < currentTime ? '开始时间不能早于当前时间' : '';
      }
      case 'endTime': {
        if (!value) return '请选择结束时间';
        const endDate = new Date(value);
        const startDate = new Date(formData.startTime);
        return endDate <= startDate ? '结束时间必须晚于开始时间' : '';
      }
      default:
        return '';
    }
  };

  // 处理字段变化
  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // 验证所有字段
  const validateForm = () => {
    const newErrors = {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
      startTime: validateField('startTime', formData.startTime),
      endTime: validateField('endTime', formData.endTime),
      location: validateField('location', formData.location),
      capacity: validateField('capacity', formData.capacity),
      categoryId: validateField('categoryId', formData.categoryId),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorMessages = Object.entries(errors)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${value}`);

      toast.error('表单验证失败', {
        description: errorMessages.join('、'),
      });
      return;
    }

    setSubmitting(true);
    try {
      await createAction({
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        location: formData.location,
        capacity: Number(formData.capacity),
        categoryId: Number(formData.categoryId),
      });

      toast.success('创建成功', {
        description: '活动已提交审核',
      });
      router.push('/profile/activities');
    } catch (error) {
      toast.error('创建失败', {
        description: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>创建活动</h2>
        <p className='text-muted-foreground mt-2'>创建一个新的活动</p>
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
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder='请输入活动标题'
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className='text-sm text-red-500'>{errors.title}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>活动描述</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                placeholder='请输入活动描述'
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className='text-sm text-red-500'>{errors.description}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startTime'>开始时间</Label>
                <Input
                  id='startTime'
                  type='datetime-local'
                  value={formData.startTime}
                  onChange={(e) =>
                    handleFieldChange('startTime', e.target.value)
                  }
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && (
                  <p className='text-sm text-red-500'>{errors.startTime}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='endTime'>结束时间</Label>
                <Input
                  id='endTime'
                  type='datetime-local'
                  value={formData.endTime}
                  onChange={(e) => handleFieldChange('endTime', e.target.value)}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && (
                  <p className='text-sm text-red-500'>{errors.endTime}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='location'>活动地点</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder='请输入活动地点'
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className='text-sm text-red-500'>{errors.location}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>活动容量</Label>
                <Input
                  id='capacity'
                  type='number'
                  min='1'
                  value={formData.capacity}
                  onChange={(e) =>
                    handleFieldChange('capacity', e.target.value)
                  }
                  placeholder='请输入活动容量'
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && (
                  <p className='text-sm text-red-500'>{errors.capacity}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='categoryId'>活动类别</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleFieldChange('categoryId', value)
                  }
                >
                  <SelectTrigger
                    className={errors.categoryId ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder='请选择活动类别' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                        {category.description && ` - ${category.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className='text-sm text-red-500'>{errors.categoryId}</p>
                )}
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
              <Button type='submit'
                disabled={submitting}>
                {submitting ? '创建中...' : '创建活动'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

