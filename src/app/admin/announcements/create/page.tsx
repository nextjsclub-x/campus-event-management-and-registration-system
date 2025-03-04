import { createAnnouncement } from '@/models/announcement/create-announcement';
import { CreateAnnouncementClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CreateAnnouncementPage() {
	return (
  <div className='p-6'>
    <CreateAnnouncementClient createAction={createAnnouncement} />
  </div>
	);
}
