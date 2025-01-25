/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/common/nav-bar';
import { post, get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function CreateActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    location: '',
    capacity: '',
    categoryId: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get('/api/category');
        if (response.code === APIStatusCode.OK) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('获取分类列表失败:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await post('/api/activities', {
        ...formData,
        capacity: parseInt(formData.capacity, 10)
      });

      if (response.code === APIStatusCode.CREATED) {
        alert('活动创建成功！');
        router.push('/');
      } else {
        alert(response.message || '创建失败，请重试');
      }
    } catch (error: any) {
      alert(error.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPublic: checked
    }));
  };

  return (
    <main className='flex-1 container mx-auto px-4 py-8'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='text-2xl'>创建新活动</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>活动标题</label>
              <Input
                required
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='请输入活动标题'
              />
            </div>
            
            <div className='space-y-2'>
              <label className='text-sm font-medium'>活动分类</label>
              <Select
                required
                value={formData.categoryId}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='请选择活动分类' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id}
                      value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className='space-y-2'>
              <label className='text-sm font-medium'>活动描述</label>
              <Textarea
                required
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='请输入活动描述'
                rows={4}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>开始时间</label>
                <Input
                  required
                  type='datetime-local'
                  name='startTime'
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>结束时间</label>
                <Input
                  required
                  type='datetime-local'
                  name='endTime'
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>活动地点</label>
              <Input
                required
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                placeholder='请输入活动地点'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>人数限制</label>
              <Input
                required
                type='number'
                name='capacity'
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder='请输入人数限制'
                min='1'
              />
            </div>
          </CardContent>

          <CardFooter className='flex justify-between'>
            <Button type='button'
              variant='outline'
              onClick={() => router.back()}>取消
            </Button>
            <Button type='submit'
              disabled={loading}>
              {loading ? '创建中...' : '创建活动'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
