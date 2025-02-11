'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { get, put } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Category | null>(null);

  const fetchCategory = async () => {
    try {
      const response = await get(`/api/category/${params.id}`);
      if (response.code === APIStatusCode.OK) {
        setFormData(response.data);
      } else {
        alert(response.message || '获取分类信息失败');
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('获取分类信息失败:', error);
      alert('获取分类信息失败');
      router.push('/admin/categories');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategory();
  }, [params.id]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    try {
      const response = await put('/api/category', {
        id: formData.id,
        name: formData.name,
        description: formData.description
      });

      if (response.code === APIStatusCode.OK) {
        alert('保存成功');
        router.push('/admin/categories');
      } else {
        alert(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存分类失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='text-center py-8'>加载中...</div>;
  }

  if (!formData) {
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

        <div className='space-y-2 text-sm text-gray-500'>
          <div>创建时间：{new Date(formData.createdAt).toLocaleString()}</div>
          <div>更新时间：{new Date(formData.updatedAt).toLocaleString()}</div>
        </div>

        <div className='flex gap-4'>
          <Button
            type='submit'
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
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
