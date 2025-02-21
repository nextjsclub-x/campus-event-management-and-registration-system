'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCategoryList } from '@/hooks/use-category';
import type { Category } from '@/types/category.types';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading } = useCategoryList({
    page,
    pageSize
  });

  const categories = response?.data?.items || [];
  const totalPages = Math.ceil((response?.data?.total || 0) / pageSize);

  return (
    <div>
      <div className='mb-8 flex justify-between items-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>分类列表</h2>
          <p className='text-muted-foreground'>
            管理所有活动分类
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/categories/create')}
        >
          新增分类
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部分类</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center'
                    >
                      暂无分类
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category: Category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className='max-w-md truncate'>
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${category.status === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {category.status === 1 ? '已发布' : '未发布'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.push(`/admin/categories/${category.id}`)}
                          >
                            查看
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                          >
                            编辑
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
