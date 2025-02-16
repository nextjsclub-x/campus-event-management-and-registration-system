'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Carousel } from '@/components/Carousel';

interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentRegistrations: number;
  status: number;
}

interface UpcomingActivity {
  id: number;
  title: string;
  startTime: string;
}

const ActivityStatus = {
  ALL: 'all',
  PUBLISHED: '2',
  CANCELLED: '3',
  COMPLETED: '4',
} as const;

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Make the default status "all" so that the first (leftmost) tab is "全部"
  const [currentStatus, setCurrentStatus] = useState<string>(ActivityStatus.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const token = useUserStore((state) => state.token);

  // Tabs in the order you want to appear: "全部", "可报名", "已结束"
  const tabItems = [
    { value: ActivityStatus.ALL, label: '全部' },
    { value: ActivityStatus.PUBLISHED, label: '可报名' },
    { value: 'ended', label: '已结束' },
  ];

  const fetchActivities = async (status?: string) => {
    try {
      let url = '/api/activity';

      // If the user selected "已结束" (ended), we still fetch published(2) first
      // and then filter out the ended ones.
      if (status === 'ended') {
        url = `/api/activity?status=${ActivityStatus.PUBLISHED}`;
      } else if (status && status !== 'all') {
        url = `/api/activity?status=${status}`;
      }

      // Always order by startTime descending
      url += `${url.includes('?') ? '&' : '?'}orderBy=startTime&order=desc`;

      const response = await get(url);
      if (response.code === APIStatusCode.OK) {
        let filteredActivities = response.data.activities || [];
        const now = new Date();

        if (status === 'ended') {
          // Filter out only the activities that have ended
          filteredActivities = filteredActivities.filter((activity: Activity) => 
            new Date(activity.endTime) < now
          );
        } else if (status === ActivityStatus.PUBLISHED) {
          // Filter out only activities that haven't ended yet
          filteredActivities = filteredActivities.filter((activity: Activity) =>
            new Date(activity.endTime) >= now
          );
        }

        if (searchQuery) {
          filteredActivities = filteredActivities.filter((activity: Activity) =>
            activity.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setActivities(filteredActivities);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(currentStatus);
  }, [currentStatus, searchQuery]);

  useEffect(() => {
    const fetchUpcomingActivities = async () => {
      if (!token) return;
      try {
        const response = await get('/api/activity?status=2');
        if (response.code === APIStatusCode.OK) {
          setUpcomingActivities(response.data.activities);
        }
      } catch (error) {
        console.error('获取即将开始的活动失败:', error);
      }
    };

    fetchUpcomingActivities();
  }, [token]);

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
  };

  const isActivityClickable = (activity: Activity) => {
    const endTime = new Date(activity.endTime);
    const now = new Date();
    if (endTime < now) {
      return false;
    }
    return activity.status === 2;
  };

  const getActivityStatusClass = (activity: Activity) => {
    const endTime = new Date(activity.endTime);
    const now = new Date();
    if (endTime < now) {
      return 'bg-gray-100 text-gray-800';
    }

    if (activity.currentRegistrations >= activity.capacity && activity.status === 2) {
      return 'bg-orange-100 text-orange-800';
    }

    switch (activity.status) {
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getActivityStatusText = (activity: Activity) => {
    const endTime = new Date(activity.endTime);
    const now = new Date();
    if (endTime < now) {
      return '已结束';
    }

    if (activity.currentRegistrations >= activity.capacity && activity.status === 2) {
      return '名额已满';
    }

    switch (activity.status) {
      case 2:
        return '可报名';
      case 3:
        return '已取消';
      case 4:
        return '已结束';
      default:
        return '草稿';
    }
  };

  const handleActivityClick = (activity: Activity, e: React.MouseEvent) => {
    if (!isActivityClickable(activity)) {
      e.preventDefault();
      const endTime = new Date(activity.endTime);
      const now = new Date();
      if (endTime < now) {
        toast.error('该活动已结束');
      } else if (activity.status === 3) {
        toast.error('该活动已取消');
      } else {
        toast.error('该活动暂不可报名');
      }
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) =>
    `${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`;

  if (loading) {
    return (
      <main className='flex-1 container mx-auto px-4 py-8'>
        <div>加载中...</div>
      </main>
    );
  }

  return (
    <main className='flex-1 w-full mx-auto px-4 py-8'>
      <div className='space-y-6'>
        <div className="mb-8">
          <Carousel />
        </div>
        <h2 className='text-3xl font-bold'>近期活动</h2>

        {token && upcomingActivities.length > 0 && (
          <Alert>
            <Bell className='h-4 w-4' />
            <AlertTitle>活动提醒</AlertTitle>
            <AlertDescription>
              您有 {upcomingActivities.length} 个活动即将开始：
              <ul className='mt-2 space-y-1'>
                {upcomingActivities.map((activity) => (
                  <li key={activity.id}>
                    <Link href={`/activities/${activity.id}`}
                      className='text-primary hover:underline'>
                      {activity.title}
                    </Link>
                    <span className='text-muted-foreground ml-2'>
                      将于 {new Date(activity.startTime).toLocaleString()} 开始
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Input
                className='w-64'
                placeholder='搜索活动标题...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={currentStatus}
              onValueChange={handleStatusChange}>
              <TabsList>
                {tabItems.map(({ value, label }) => (
                  <TabsTrigger key={value}
                    value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <Link href='/activities/create'>
            <Button>创建活动</Button>
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className={`hover:shadow-lg transition-shadow ${
                  !isActivityClickable(activity) ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>
                    <div className='flex justify-between items-center'>
                      <span>{new Date(activity.startTime).toLocaleString()}</span>
                      <div className='flex gap-2'>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${getActivityStatusClass(activity)}`}
                        >
                          {getActivityStatusText(activity)}
                        </span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground line-clamp-2'>
                    {activity.description}
                  </p>
                  <p className='text-sm text-muted-foreground mt-2'>
                    已报名：{activity.currentRegistrations || 0}/{activity.capacity}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/activities/${activity.id}`}
                    className='w-full'
                    onClick={(e) => handleActivityClick(activity, e)}
                  >
                    <Button
                      className='w-full'
                      variant={isActivityClickable(activity) ? 'default' : 'secondary'}
                    >
                      查看详情
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted-foreground'>暂无活动</div>
        )}
      </div>
    </main>
  );
}
