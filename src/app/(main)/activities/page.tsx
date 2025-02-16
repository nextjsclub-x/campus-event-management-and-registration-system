'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { get } from '@/utils/request/request';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user';
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
import { Badge } from "@/components/ui/badge";

// 活动接口
interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentParticipants: number;
  categoryId: number;
  category: {
    name: string;
  };
  status: 'upcoming' | 'ongoing' | 'ended';
}

// 分类接口
interface Category {
  id: number;
  name: string;
}

const ActivitiesPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { userId, role } = useUserStore();

  // 状态管理
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  // 获取活动列表
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await get('/api/activity?' + queryParams.toString());
      if (response.code === 200) {
        setActivities(response.data.activities);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取活动列表失败',
        description: '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await get('/api/category');
      if (response.code === 200) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [currentPage, filters]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取活动状态标签
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: '即将开始', variant: 'secondary' },
      ongoing: { label: '进行中', variant: 'success' },
      ended: { label: '已结束', variant: 'destructive' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">活动列表</h1>
        {userId && (
          <Button onClick={() => router.push('/activities/create')}>
            创建活动
          </Button>
        )}
      </div>

      {/* 筛选区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="搜索活动..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部分类</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="活动状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            <SelectItem value="upcoming">即将开始</SelectItem>
            <SelectItem value="ongoing">进行中</SelectItem>
            <SelectItem value="ended">已结束</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 活动列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{activity.title}</CardTitle>
                {getStatusBadge(activity.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {activity.description}
              </p>
              <div className="space-y-2 text-sm">
                <p>🕒 开始时间：{formatDate(activity.startTime)}</p>
                <p>📍 地点：{activity.location}</p>
                <p>👥 报名情况：{activity.currentParticipants}/{activity.capacity}</p>
                <p>📑 分类：{activity.category.name}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/activities/' + activity.id)}
              >
                查看详情
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage; 