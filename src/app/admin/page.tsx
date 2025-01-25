'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-8'>管理后台</h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Link href='/admin/activities'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <CardTitle>活动管理</CardTitle>
              <CardDescription>管理所有活动</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                创建、编辑、删除活动，管理活动状态
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href='/admin/registrations'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <CardTitle>报名管理</CardTitle>
              <CardDescription>管理活动报名</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                查看所有报名记录，审核报名申请
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href='/admin/categories'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <CardTitle>分类管理</CardTitle>
              <CardDescription>管理活动分类</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                创建、编辑、删除活动分类
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href='/admin/users'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理系统用户</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                查看用户列表，统计用户活动参与情况
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
