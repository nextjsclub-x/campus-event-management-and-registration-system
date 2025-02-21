'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Check, Pencil } from 'lucide-react';
import {
  useAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
  useToggleAnnouncementPublishStatus
} from '@/hooks/use-announcement';
import type { Announcement } from '@/schema/announcement.schema';
import type { UpdateAnnouncementParams } from '@/types/announcement.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// 用于编辑表单的类型
type AnnouncementEditData = Pick<Announcement, 'title' | 'content'>;

export default function AnnouncementDetailPage({
  params,
}: { params: { id: string } }) {
  const router = useRouter();
  const id = Number.parseInt(params.id, 10);
  const { data, isLoading } = useAnnouncement(id);
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement();
  const { mutate: updateAnnouncement, isPending: isUpdating } = useUpdateAnnouncement(id);
  const { mutate: togglePublish, isPending: isToggling } = useToggleAnnouncementPublishStatus();

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateAnnouncementParams>({
    title: '',
    content: ''
  });

  // 开始编辑
  const handleStartEdit = () => {
    if (data?.data) {
      setEditData({
        title: data.data.title,
        content: data.data.content
      });
      setIsEditing(true);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ title: '', content: '' });
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editData.title?.trim() || !editData.content?.trim()) return;

    updateAnnouncement(editData, {
      onSuccess: () => {
        setIsEditing(false);
        setEditData({ title: '', content: '' });
      }
    });
  };

  // 删除公告
  const handleDelete = () => {
    deleteAnnouncement(id, {
      onSuccess: () => {
        router.push('/admin/announcements');
      }
    });
  };

  // 切换发布状态
  const handleTogglePublish = () => {
    if (data?.data) {
      togglePublish(id);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const announcement = data.data;

  return (
    <div>
      <div className='mb-8'>
        <div className='flex justify-between items-start'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-bold'>公告详情</h2>
            <p className='text-muted-foreground'>查看和管理公告信息</p>
          </div>
          <div className='space-x-4'>
            {!isEditing ? (
              <>
                <Button
                  variant='outline'
                  onClick={handleStartEdit}
                  disabled={isUpdating || isDeleting || isToggling}
                >
                  <Pencil className='h-4 w-4 mr-2' />
                  编辑
                </Button>
                <Button
                  variant='outline'
                  onClick={handleTogglePublish}
                  disabled={isUpdating || isDeleting || isToggling}
                >
                  {announcement.isPublished ? '取消发布' : '发布'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='destructive'
                      disabled={isUpdating || isDeleting || isToggling}
                    >
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将删除该公告，删除后无法恢复。确定要继续吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className='h-4 w-4 mr-2' />
                  取消
                </Button>
                <Button
                  variant='default'
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                >
                  <Check className='h-4 w-4 mr-2' />
                  保存
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>公告信息</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>标题</p>
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                placeholder='请输入公告标题'
              />
            ) : (
              <p>{announcement.title}</p>
            )}
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>内容</p>
            {isEditing ? (
              <Textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                placeholder='请输入公告内容'
                rows={6}
              />
            ) : (
              <p className='whitespace-pre-wrap'>{announcement.content}</p>
            )}
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>发布状态</p>
            <p>
              <span
                className={`px-2 py-1 rounded-full text-xs ${announcement.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}
              >
                {announcement.isPublished ? '已发布' : '未发布'}
              </span>
            </p>
          </div>

          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>创建时间</p>
              <p>{new Date(announcement.createdAt).toLocaleString('zh-CN')}</p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-muted-foreground'>更新时间</p>
              <p>{new Date(announcement.updatedAt).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
