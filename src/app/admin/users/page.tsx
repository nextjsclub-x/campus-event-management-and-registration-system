import { getUsers } from '@/models/user/get-users';
import { updateUser } from '@/models/user/update-user';
import { softDeleteUser } from '@/models/user/soft-delete-user';
import type { User, UserRole } from '@/schema/user.schema';
import { UsersClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { page?: string };
}

export default async function UsersPage({ searchParams }: PageProps) {
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
  const { items: users, totalPages } = await getUsers({
    page,
    limit: 10,
  });

  const handleSoftDelete = async (id: number): Promise<void> => {
    'use server';

    await softDeleteUser(id);
    // 这里可以添加代码来刷新用户列表
  };

  const handleUpdate = async (id: number, role: UserRole): Promise<User> => {
    'use server';

    return updateUser(id, { role });
  };

  return (
    <div className='p-6'>
      <UsersClient
        users={users}
        currentPage={page}
        totalPages={totalPages}
        updateAction={handleUpdate}
        handleSoftDelete={handleSoftDelete}
      />
    </div>
  );
}

