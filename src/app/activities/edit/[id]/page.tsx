/* eslint-disable jsx-a11y/label-has-associated-control */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ActivityForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
}

export default function EditActivityPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ActivityForm>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 0,
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${params.id}`);
        const data = await response.json();
        if (data.success) {
          const activity = data.data;
          setFormData({
            title: activity.title,
            description: activity.description,
            startTime: new Date(activity.startTime).toISOString().slice(0, 16),
            endTime: new Date(activity.endTime).toISOString().slice(0, 16),
            location: activity.location,
            capacity: activity.capacity,
          });
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/activities/${params.id}`);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader>
          <CardTitle>编辑活动</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}
            className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>活动标题</label>
              <Input
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>活动描述</label>
              <Textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>开始时间</label>
                <Input
                  type='datetime-local'
                  name='startTime'
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>结束时间</label>
                <Input
                  type='datetime-local'
                  name='endTime'
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>地点</label>
              <Input
                name='location'
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>人数限制</label>
              <Input
                type='number'
                name='capacity'
                value={formData.capacity}
                onChange={handleChange}
                min='1'
                required
              />
            </div>
            <Button type='submit'
              className='w-full'>保存修改
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
