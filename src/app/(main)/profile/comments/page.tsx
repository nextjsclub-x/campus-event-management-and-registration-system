import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserComments } from '@/models/comment/get-user-comments';
import { CommentsClient } from './client';

interface PageProps {
  searchParams: { page?: string };
}

export default async function UserCommentsPage({ searchParams }: PageProps) {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    redirect('/login');
  }

  const page = Number(searchParams.page) || 1;
  const response = await getUserComments({
    userId: Number(userId),
    page,
    pageSize: 10,
  });

  return (
    <div className='container mx-auto py-12'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>我的留言</h1>
        <p className='text-muted-foreground mt-2'>查看我发表过的所有留言</p>
      </div>
      <CommentsClient
        comments={response.data}
        pagination={response.pagination}
        userId={Number(userId)} />
    </div>
  );
}