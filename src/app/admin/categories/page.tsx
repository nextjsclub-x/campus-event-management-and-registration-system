import { getCategories } from '@/models/category/get-categories';
import { CategoriesClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { page?: string };
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;

  const categoriesData = await getCategories({
    page: currentPage,
    limit: 10,
    order: 'desc',
  });

  return (
    <div className='p-6'>
      <CategoriesClient
        initialData={categoriesData}
        currentPage={currentPage}
      />
    </div>
  );
}

