import { getAnnouncement } from '@/models/announcement';
import { notFound } from 'next/navigation';
import { AnnouncementClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	params: { id: string };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
	const announcementId = Number.parseInt(params.id, 10);

	try {
		const announcement = await getAnnouncement(announcementId);

		// 如果公告未发布，返回 404
		if (!announcement.isPublished) {
			return notFound();
		}

		return <AnnouncementClient announcement={announcement} />;
	} catch (error) {
		return notFound();
	}
}
