'use server';

import db from '@/database/neon.db';
import { categories } from '@/schema/category.schema';
import type { NewCategory, Category } from './utils';
import { checkCategoryNameExists } from './utils';

export async function createCategory(
	categoryData: NewCategory,
): Promise<Category> {
	await checkCategoryNameExists(categoryData.name);

	const [newCategory] = await db
		.insert(categories)
		.values(categoryData)
		.returning();

	return newCategory;
}

