import { getCategory, updateCategory } from '@/models/category';
import type { NewCategory } from '@/models/category/utils';
import { CategoryClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const categoryId = Number.parseInt(params.id, 10);
  const category = await getCategory(categoryId);

  return (
    <CategoryClient
      category={category}
      categoryId={categoryId}
      updateAction={updateCategory}
    />
  );
}

