import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/models/user/get-user-by-id';
import { updateUser } from '@/models/user/update-user';
import { revalidatePath } from 'next/cache';
import { ProfileClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function handleUpdateName(name: string) {
  'use server';

  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    throw new Error('请先登录');
  }

  await updateUser(Number(userId), { name });
  revalidatePath('/profile');
}

export default async function ProfilePage() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    redirect('/login');
  }

  const user = await getUserById(Number(userId));

  return <ProfileClient
    user={user}
    updateAction={handleUpdateName}
  />;
}

