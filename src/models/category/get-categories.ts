'use server';

import db from '@/database/neon.db';
import { categories } from '@/schema/category.schema';
import type { Category } from './utils';

export async function getCategories(): Promise<Category[]> {
  return db.select().from(categories);
}
