'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
} from "@/components/ui/alert-dialog";
import type { Announcement } from '@/models/announcement/utils';

interface AnnouncementClientProps {
  announcement: Announcement;
  updateAction: (
    id: number,
    data: {
      title?: string;
      content?: string;
      isPublished?: boolean;
    },
  ) => Promise<Announcement>;
  deleteAction: (id: number) => Promise<void>;
}

export function AnnouncementClient({
  announcement: initialAnnouncement,
  updateAction,
  deleteAction,
}: AnnouncementClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [announcement, setAnnouncement] = useState(initialAnnouncement);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateAction(announcement.id, {
        title: announcement.title,
        content: announcement.content,
        isPublished: announcement.isPublished === 1,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('更新公告失败:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteAction(announcement.id);
      router.push('/admin/announcements');
      router.refresh();
    } catch (error) {
      console.error('删除公告失败:', error);
    } finally {
      setIsPending(false);
    }
  };

  if (!isEditing) {
    return (
      <main className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>公告详情</h1>
          <div className='space-x-2'>
            <Button onClick={() => setIsEditing(true)}>编辑</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">删除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除该公告。删除后不可恢复，是否确认？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant='outline'
              onClick={() => router.push('/admin/announcements')}
            >
              返回
            </Button>
          </div>
        </div>

        <div className='max-w-2xl space-y-6'>
          <div className='space-y-2'>
            <div className='text-sm font-medium'>标题</div>
            <Input value={announcement.title}
              readOnly />
          </div>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>内容</div>
            <Textarea value={announcement.content}
              readOnly
              rows={8} />
          </div>

          <div className='space-y-2 text-sm text-gray-500'>
            <div>
              创建时间：{new Date(announcement.createdAt).toLocaleString()}
            </div>
            <div>
              更新时间：{new Date(announcement.updatedAt).toLocaleString()}
            </div>
            <div>
              状态：{announcement.isPublished === 1 ? '已发布' : '未发布'}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>编辑公告</h1>
        <Button variant='outline'
          onClick={() => setIsEditing(false)}>
          取消
        </Button>
      </div>

      <form onSubmit={handleSubmit}
        className='max-w-2xl space-y-6'>
        <div className='space-y-2'>
          <Label>
            标题
            <span className='text-red-500 ml-1'>*</span>
          </Label>
          <Input
            required
            value={announcement.title}
            onChange={(e) =>
              setAnnouncement({ ...announcement, title: e.target.value })
            }
            placeholder='请输入公告标题'
          />
        </div>

        <div className='space-y-2'>
          <Label>
            内容
            <span className='text-red-500 ml-1'>*</span>
          </Label>
          <Textarea
            required
            value={announcement.content}
            onChange={(e) =>
              setAnnouncement({ ...announcement, content: e.target.value })
            }
            placeholder='请输入公告内容'
            rows={8}
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='isPublished'
            checked={announcement.isPublished === 1}
            onCheckedChange={(checked) =>
              setAnnouncement({ ...announcement, isPublished: checked ? 1 : 0 })
            }
          />
          <Label htmlFor='isPublished'>发布状态</Label>
        </div>

        <div className='flex gap-4'>
          <Button type='submit'
            disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => setIsEditing(false)}
          >
            取消
          </Button>
        </div>
      </form>
    </main>
  );
}

