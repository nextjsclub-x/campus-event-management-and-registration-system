import { listAnnouncements } from '@/models/announcement';
import { AnnouncementsClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnnouncementsPage() {
	const { announcements } = await listAnnouncements({
		isPublished: 1,
		pageSize: 50,
	});

	return (
  <div className='container mx-auto py-12'>
    <h1 className='text-3xl font-bold mb-8'>系统公告</h1>
    <AnnouncementsClient announcements={announcements} />
  </div>
	);
}
