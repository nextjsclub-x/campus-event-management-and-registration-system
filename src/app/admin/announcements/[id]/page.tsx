/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-closing-tag-location */
import { getAnnouncement } from '@/models/announcement/get-announcement';
import { updateAnnouncement } from '@/models/announcement/update-announcement';
import { deleteAnnouncement } from '@/models/announcement/delete-announcement';
import type { Announcement } from '@/models/announcement/utils';
import { AnnouncementClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
	params: { id: string };
}

async function handleUpdate(
	id: number,
	data: {
		title?: string;
		content?: string;
		isPublished?: boolean;
	},
): Promise<Announcement> {
	'use server';

	return updateAnnouncement(id, {
		...data,
		isPublished: data.isPublished ? 1 : 0,
	});
}

async function handleDelete(id: number): Promise<void> {
	'use server';

	await deleteAnnouncement(id);
}

export default async function AnnouncementPage({ params }: PageProps) {
	const announcementId = Number.parseInt(params.id, 10);
	const announcement = await getAnnouncement(announcementId);

	return (<div className='p-6'>
	  <AnnouncementClient
        announcement={announcement}
        updateAction={handleUpdate}
        deleteAction={handleDelete}
	/>
           </div>	);
}
