/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategory, useUpdateCategory } from '@/hooks/use-category';

export default function EditCategoryPage({
  params,
}: { params: { id: string } }) {
  const router = useRouter();
  const categoryId = Number.parseInt(params.id, 10);

  const { data: response, isLoading } = useCategory(categoryId);
  const { mutate: updateCategory, isPending: isSaving } =
    useUpdateCategory(categoryId);

  const category = response?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    updateCategory({
      name: category.name,
      description: category.description,
    });
  };

  if (isLoading) {
    return <div className='text-center py-8'>加载中...</div>;
  }

  if (!category) {
    return <div className='text-center py-8'>分类不存在</div>;
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>编辑分类</h1>
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
            value={category.name}
            onChange={(e) => updateCategory({ ...category, name: e.target.value })}
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
            value={category.description}
            onChange={(e) => updateCategory({ ...category, description: e.target.value })}
            placeholder='请输入分类描述'
            rows={4}
          />
        </div>

        <div
          className='space-y-2 text-sm text-gray-500'
        >
          <div>创建时间：{new Date(category.createdAt).toLocaleString()}</div>
          <div>更新时间：{new Date(category.updatedAt).toLocaleString()}</div>
        </div>

        <div
          className='flex gap-4'
        >
          <Button
            type='submit'
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
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
