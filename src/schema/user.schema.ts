import { bigserial, timestamp, varchar, smallint, pgEnum, pgTable } from 'drizzle-orm/pg-core';

// Create enum for user roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'teacher', 'student']);
export type UserRole = 'student' | 'teacher' | 'admin';

// Users table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: smallint('status').default(1).notNull(),
  deletedAt: timestamp('deleted_at'),
  studentId: varchar('student_id', { length: 50 }) // 添加的字段，类型为 varchar，允许为空
});

// 类型推导
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
