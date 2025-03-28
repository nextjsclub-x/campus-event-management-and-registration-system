'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Activity, ActivityStatusType } from '@/types/activity.types';
import { ActivityStatus } from '@/types/activity.types';

interface ActivitiesClientProps {
  activities: Activity[];
  onStatusChange: (status: ActivityStatusType | undefined) => void;
  currentStatus?: ActivityStatusType;
  currentPage: number;
  totalPages: number;
  total: number;
  currentKeyword?: string;
  currentSearchField?: string;
}

const statusMap: Record<
  ActivityStatusType,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  [ActivityStatus.PENDING]: { label: '待审核', variant: 'secondary' },
  [ActivityStatus.PUBLISHED]: { label: '已发布', variant: 'default' },
  [ActivityStatus.CANCELLED]: { label: '已取消', variant: 'outline' },
  [ActivityStatus.COMPLETED]: { label: '已结束', variant: 'secondary' },
  [ActivityStatus.DELETED]: { label: '已删除', variant: 'destructive' },
};

const isValidActivityStatus = (value: number): value is ActivityStatusType =>
  Object.values(ActivityStatus).includes(value as ActivityStatusType);

const searchFieldOptions = [
  { value: 'all', label: '全部字段' },
  { value: 'title', label: '活动标题' },
  { value: 'description', label: '活动描述' },
  { value: 'location', label: '活动地点' },
];

export function ActivitiesClient({
  activities,
  onStatusChange,
  currentStatus,
  currentPage,
  totalPages,
  total,
  currentKeyword = '',
  currentSearchField = 'all',
}: ActivitiesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(currentKeyword);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (keyword) {
      params.set('keyword', keyword);
    } else {
      params.delete('keyword');
    }
    params.set('page', '1'); // 搜索时重置页码
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchFieldChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('searchField');
    } else {
      params.set('searchField', value);
    }
    params.set('page', '1'); // 切换搜索字段时重置页码
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.set('page', '1'); // 切换状态时重置页码
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>活动管理</h1>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Select
              value={currentSearchField}
              onValueChange={handleSearchFieldChange}
            >
              <SelectTrigger 
                className='w-[120px]'
              >
                <SelectValue placeholder='搜索字段' />
              </SelectTrigger>
              <SelectContent>
                {searchFieldOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder='搜索活动...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-[200px]'
            />
            <Button onClick={handleSearch}>
              搜索
            </Button>
          </div>
          <Select
            value={currentStatus?.toString() || 'all'}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger 
              className='w-[180px]'
            >
              <SelectValue placeholder='选择状态过滤' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              {Object.entries(statusMap).map(([status, { label }]) => (
                <SelectItem 
                  key={status} 
                  value={status}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant='outline'
            onClick={() => router.push('/admin')}
          >
            返回
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>活动列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>活动名称</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>结束时间</TableHead>
                <TableHead>地点</TableHead>
                <TableHead>报名人数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}
                    className='text-center'>
                    暂无活动
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.id}</TableCell>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>
                      {new Date(activity.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(activity.endTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{activity.location}</TableCell>
                    <TableCell>
                      {activity.currentRegistrations ?? 0}/{activity.capacity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusMap[activity.status as ActivityStatusType]
                            ?.variant
                        }
                      >
                        {
                          statusMap[activity.status as ActivityStatusType]
                            ?.label
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          router.push(`/admin/activities/${activity.id}`)
                        }
                      >
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className='mt-4 flex justify-center'>
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

