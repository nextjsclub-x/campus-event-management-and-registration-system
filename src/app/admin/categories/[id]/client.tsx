/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/schema/category.schema';
import type { NewCategory } from '@/models/category/utils';

interface CategoryClientProps {
  category: Category;
  categoryId: number;
  updateAction: (
    categoryId: number,
    data: Partial<NewCategory>,
  ) => Promise<{ message: string }>;
}

export function CategoryClient({
  category: initialCategory,
  categoryId,
  updateAction,
}: CategoryClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateAction(categoryId, {
        name: category.name,
        description: category.description,
        status: category.status,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('更新分类失败:', error);
    } finally {
      setIsPending(false);
    }
  };

  if (!isEditing) {
    return (
      <main className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>分类详情</h1>
          <div className='space-x-2'>
            <Button onClick={() => setIsEditing(true)}>编辑</Button>
            <Button
              variant='outline'
              onClick={() => router.push('/admin/categories')}
            >
              返回
            </Button>
          </div>
        </div>

        <div className='max-w-2xl space-y-6'>
          <div className='space-y-2'>
            <div className='text-sm font-medium'>分类名称</div>
            <Input value={category.name}
              readOnly />
          </div>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>分类描述</div>
            <Textarea value={category.description || ''}
              readOnly
              rows={4} />
          </div>

          <div className='space-y-2 text-sm text-gray-500'>
            <div>创建时间：{new Date(category.createdAt).toLocaleString()}</div>
            <div>更新时间：{new Date(category.updatedAt).toLocaleString()}</div>
            <div>状态：{category.status === 1 ? '已发布' : '未发布'}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>编辑分类</h1>
        <Button variant='outline'
          onClick={() => setIsEditing(false)}>
          取消
        </Button>
      </div>

      <form onSubmit={handleSubmit}
        className='max-w-2xl space-y-6'>
        <div className='space-y-2'>
          <div className='text-sm font-medium'>
            分类名称
            <span className='text-red-500 ml-1'>*</span>
          </div>
          <Input
            required
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            placeholder='请输入分类名称'
          />
        </div>

        <div className='space-y-2'>
          <div className='text-sm font-medium'>分类描述</div>
          <Textarea
            value={category.description || ''}
            onChange={(e) =>
              setCategory({ ...category, description: e.target.value })
            }
            placeholder='请输入分类描述'
            rows={4}
          />
        </div>

        <div className='flex gap-4'>
          <Button type='submit'
            disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => setIsEditing(false)}
          >
            取消
          </Button>
        </div>
      </form>
    </main>
  );
}

