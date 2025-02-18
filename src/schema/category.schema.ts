'lock';

import { bigserial, timestamp, varchar, text, smallint, index, pgTable } from 'drizzle-orm/pg-core';

// Categories table
export const categories = pgTable('categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 类别ID
  name: varchar('name', { length: 50 }).notNull().unique(),
  // 类别名称，长度为50，唯一且不能为空
  description: text('description'),
  // 类别描述，可以为空
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 创建时间，默认为当前时间，不能为空
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // 更新时间，默认为当前时间，不能为空
  status: smallint('status').default(1).notNull(),
  // 类别状态，默认为1（激活），不能为空
}, (table) => ({
    nameIdx: index('idx_categories_name').on(table.name),
    // 为类别名称创建索引
  }));

// 类型推导
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
