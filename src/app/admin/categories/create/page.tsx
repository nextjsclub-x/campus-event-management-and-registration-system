import { createCategory } from '@/models/category';
import type { NewCategory } from '@/models/category/utils';
import { CreateCategoryClient } from './client';

async function handleCreate(data: NewCategory) {
	'use server';

	await createCategory(data);
}

export default function CreateCategoryPage() {
	return <CreateCategoryClient onSubmit={handleCreate} />;
}
