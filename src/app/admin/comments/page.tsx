import { getComments } from '@/models/comment/get-comments';
import { CommentsClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { page?: string };
}

export default async function CommentsPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;

  const commentsData = await getComments({
    page: currentPage,
    limit: 10,
    order: 'desc',
  });

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>社区留言管理</h2>
          <p className='text-muted-foreground'>查看和管理社区留言</p>
        </div>
      </div>

      <CommentsClient initialData={commentsData}
        currentPage={currentPage} />
    </div>
  );
}

