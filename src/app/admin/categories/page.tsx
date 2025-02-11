'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await get('/api/category');
      if (response.code === APIStatusCode.OK) {
        setCategories(response.data.categories);
      } else {
        alert(response.message || '获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      alert('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>分类管理</h1>
        <div className='space-x-4'>
          <Button
            onClick={() => router.push('/admin/categories/create')}
          >
            新增分类
          </Button>
          <Button
            variant='outline'
            onClick={() => router.push('/admin')}
          >
            返回
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='text-center'>加载中...</div>
      ) : (
        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>分类名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className='font-medium'>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(category.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className='space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => router.push(`/admin/categories/${category.id}`)}
                      >
                        编辑
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
} 
