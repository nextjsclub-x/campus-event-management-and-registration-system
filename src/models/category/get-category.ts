'use server';

import { eq } from 'drizzle-orm';
import db from '@/database/neon.db';
import { categories } from '@/schema/category.schema';
import type { Category } from '@/schema/category.schema';
import { CategoryError } from './utils';

export async function getCategory(id: number): Promise<Category> {
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.id, id));

	if (!category) {
		throw new Error(CategoryError.NOT_FOUND);
	}

	return category;
}

