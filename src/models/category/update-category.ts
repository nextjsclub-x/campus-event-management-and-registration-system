'use server';

import db from '@/database/neon.db';
import { eq } from 'drizzle-orm';
import { categories } from '@/schema/category.schema';
import type { NewCategory } from './utils';
import { checkCategoryExists, checkCategoryNameExists } from './utils';

export async function updateCategory(
	categoryId: number,
	categoryData: Partial<NewCategory>,
) {
	await checkCategoryExists(categoryId);
	if (categoryData.name) {
		await checkCategoryNameExists(categoryData.name, categoryId);
	}

	await db
		.update(categories)
		.set({
			...categoryData,
			updatedAt: new Date(),
		})
		.where(eq(categories.id, categoryId));

	return { message: 'Category updated successfully' };
}
