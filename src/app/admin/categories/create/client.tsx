'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { NewCategory } from '@/models/category/utils';

interface CreateCategoryClientProps {
  onSubmit: (data: NewCategory) => Promise<void>;
}

export function CreateCategoryClient({ onSubmit }: CreateCategoryClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<NewCategory>({
    name: '',
    description: '',
    status: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await onSubmit(formData);
      router.push('/admin/categories');
    } catch (error) {
      // 这里可以添加错误处理，比如显示一个 toast
      console.error('创建分类失败:', error);
    } finally {
      setIsPending(false);
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
          <div className='text-sm font-medium'>
            分类名称
            <span className='text-red-500 ml-1'>*</span>
          </div>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder='请输入分类名称'
          />
        </div>

        <div className='space-y-2'>
          <div className='text-sm font-medium'>分类描述</div>
          <Textarea
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder='请输入分类描述'
            rows={4}
          />
        </div>

        <div className='flex gap-4'>
          <Button type='submit'
            disabled={isPending}>
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


