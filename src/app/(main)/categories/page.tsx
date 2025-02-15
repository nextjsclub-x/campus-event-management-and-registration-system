'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/common/nav-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { get, post, put, del } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await get('/api/category');
      if (response.code === APIStatusCode.OK) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('请输入分类名称');
      return;
    }

    try {
      const response = await post('/api/category', { name: newCategoryName });
      if (response.code === APIStatusCode.CREATED) {
        alert('创建成功');
        setIsCreateDialogOpen(false);
        setNewCategoryName('');
        fetchCategories();
      } else {
        alert(response.message || '创建失败');
      }
    } catch (error: any) {
      alert(error.message || '创建失败');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    try {
      const response = await put(`/api/category/${editingCategory.id}`, {
        name: editingCategory.name
      });
      if (response.code === APIStatusCode.OK) {
        alert('更新成功');
        setIsEditDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert(response.message || '更新失败');
      }
    } catch (error: any) {
      alert(error.message || '更新失败');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('确定要删除这个分类吗？')) {
      return;
    }

    try {
      const response = await del(`/api/category/${id}`);
      if (response.code === APIStatusCode.OK) {
        alert('删除成功');
        fetchCategories();
      } else {
        alert(response.message || '删除失败');
      }
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col'>
        <NavBar />
        <main className='flex-1 container mx-auto px-4 py-8'>
          <div>加载中...</div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <NavBar />

      <main className='flex-1 container mx-auto px-4 py-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-2xl'>分类管理</CardTitle>
            <Dialog open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>新增分类</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增分类</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>分类名称</Label>
                    <Input
                      id='name'
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder='请输入分类名称'
                    />
                  </div>
                  <div className='flex justify-end'>
                    <Button onClick={handleCreateCategory}>确定</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className='text-right'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(category.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className='text-right space-x-2'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setEditingCategory(category);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-name'>分类名称</Label>
              <Input
                id='edit-name'
                value={editingCategory?.name || ''}
                onChange={(e) =>
                  setEditingCategory(
                    editingCategory
                      ? { ...editingCategory, name: e.target.value }
                      : null
                  )
                }
                placeholder='请输入分类名称'
              />
            </div>
            <div className='flex justify-end'>
              <Button onClick={handleEditCategory}>确定</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className='border-t'>
        <div className='container mx-auto px-4 py-6 text-center text-muted-foreground'>
          <p>© 2024 校园活动管理系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
