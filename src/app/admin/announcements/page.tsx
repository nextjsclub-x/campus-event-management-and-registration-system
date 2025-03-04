import { getAnnouncements } from '@/models/announcement/get-announcements';
import { AnnouncementsClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	searchParams: { page?: string };
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
	const currentPage = Number(searchParams.page) || 1;

	const announcementsData = await getAnnouncements({
		page: currentPage,
		limit: 10,
		order: 'desc',
	});

	return (
  <div className='p-6'>
    <AnnouncementsClient
      initialData={announcementsData}
      currentPage={currentPage}
			/>
  </div>
	);
}
