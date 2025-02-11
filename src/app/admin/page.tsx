'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>欢迎使用管理后台</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            请从左侧菜单选择要管理的功能模块
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
