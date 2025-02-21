/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCategory } from '@/hooks/use-category';

export default function CreateCategoryPage() {
  const router = useRouter();
  const { mutate: createCategory, isPending } = useCreateCategory();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory(formData, {
      onSuccess: () => router.push('/admin/categories')
    });
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

      <form
        onSubmit={handleSubmit}
        className='max-w-2xl space-y-6'
      >
        <div
          className='space-y-2'
        >
          <label
            htmlFor='name'
            className='text-sm font-medium'
          >
            分类名称
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <Input
            id='name'
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder='请输入分类名称'
          />
        </div>

        <div
          className='space-y-2'
        >
          <label
            htmlFor='description'
            className='text-sm font-medium'
          >
            分类描述
          </label>
          <Textarea
            id='description'
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder='请输入分类描述'
            rows={4}
          />
        </div>

        <div
          className='flex gap-4'
        >
          <Button
            type='submit'
            disabled={isPending}
          >
            {isPending ? '创建中...' : '创建分类'}
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
