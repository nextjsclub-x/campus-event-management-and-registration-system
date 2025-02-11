'use client';

import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { get } from '@/utils/request/request';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '@/schema/announcement.schema';
import type { APIResponse } from '@/schema/api-response.schema';

interface AnnouncementListResponse {
  announcements: Announcement[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnnouncementListResponse>({
    announcements: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await get('/api/announcements');
      const apiResponse = response as APIResponse<AnnouncementListResponse>;
      if (apiResponse?.data?.announcements) {
        setData(apiResponse.data);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '获取公告列表失败',
        description: error.message || '请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div>
      <div className='mb-8 flex justify-between items-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>公告列表</h2>
          <p className='text-muted-foreground'>
            管理所有系统公告
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/announcements/create')}
        >
          新增公告
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部公告</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                {(!data.announcements || data.announcements.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6}
                      className='text-center'>
                      暂无公告
                    </TableCell>
                  </TableRow>
                ) : (
                  data.announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>{announcement.id}</TableCell>
                      <TableCell>{announcement.title}</TableCell>
                      <TableCell className='max-w-md truncate'>
                        {announcement.content}
                      </TableCell>
                      <TableCell>
                        {new Date(announcement.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          announcement.isPublished 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {announcement.isPublished ? '已发布' : '未发布'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className='space-x-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.push(`/admin/announcements/${announcement.id}`)}
                          >
                            查看
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => router.push(`/admin/announcements/${announcement.id}/edit`)}
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
