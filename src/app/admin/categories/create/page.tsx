/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { post } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await post('/api/category', formData);
      if (response.code === APIStatusCode.CREATED) {
        alert('创建成功');
        router.push('/admin/categories');
      } else {
        alert(response.message || '创建失败');
      }
    } catch (error) {
      console.error('创建分类失败:', error);
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>新增分类</h1>
        <Button
          variant='outline'
          onClick={() => router.push('/admin/categories')}
        >
          返回
        </Button>
      </div>

      <form onSubmit={handleSubmit}
        className='max-w-2xl space-y-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>
            分类名称
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder='请输入分类名称'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>分类描述</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder='请输入分类描述'
            rows={4}
          />
        </div>

        <div className='flex gap-4'>
          <Button
            type='submit'
            disabled={loading}
          >
            {loading ? '创建中...' : '创建分类'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/categories')}
          >
            取消
          </Button>
        </div>
      </form>
    </main>
  );
} 
