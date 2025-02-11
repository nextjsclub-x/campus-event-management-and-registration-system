import { bigserial, timestamp, varchar, text, smallint, index, pgTable } from 'drizzle-orm/pg-core';

// Categories table
export const categories = pgTable('categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: smallint('status').default(1).notNull(),
}, (table) => ({
    nameIdx: index('idx_categories_name').on(table.name),
  }));
