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
import type { Category } from '@/schema/category.schema';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface CategoriesClientProps {
  initialData: {
    items: Category[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  currentPage: number;
}

export function CategoriesClient({
  initialData,
  currentPage,
}: CategoriesClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(currentPage);

  const categories = initialData.items;
  const { totalPages, total } = initialData;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/admin/categories?page=${newPage}`);
    // 强制刷新路由，确保获取新数据
    router.refresh();
  };

  return (
    <div>
      <div className='mb-8 flex justify-between items-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>分类列表</h2>
          <p className='text-muted-foreground'>管理所有活动分类</p>
        </div>
        <Button onClick={() => router.push('/admin/categories/create')}>
          新增分类
        </Button>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>全部分类</CardTitle>
          <div className='text-sm text-muted-foreground'>共 {total} 条记录</div>
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={6}
                    className='text-center'>
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${category.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {category.status === 1 ? '已发布' : '未发布'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          router.push(`/admin/categories/${category.id}`)
                        }
                      >
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {(categories?.length ?? 0) > 0 && (
            <div className='mt-4 flex flex-col items-center gap-2'>
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(page - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => handlePageChange(p)}
                          isActive={page === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(page + 1)}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
              <div className='text-sm text-muted-foreground'>
                第 {page} 页，共 {totalPages} 页
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


