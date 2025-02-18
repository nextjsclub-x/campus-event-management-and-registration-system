import { bigserial, timestamp, varchar, smallint, pgEnum, pgTable } from 'drizzle-orm/pg-core';

// 创建用户角色的枚举类型
export const userRoleEnum = pgEnum('user_role', ['admin', 'teacher', 'student']);
export type UserRole = 'student' | 'teacher' | 'admin';

// Users table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // 用户ID，主键，自动递增
  email: varchar('email', { length: 100 }).notNull().unique(),
  // 用户邮箱，长度为100，唯一且不能为空
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  // 密码哈希值，长度为255，不能为空
  name: varchar('name', { length: 100 }).notNull(),
  // 用户姓名，长度为100，不能为空
  role: userRoleEnum('role').notNull(),
  // 用户角色，使用之前定义的枚举，不能为空
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // 用户创建时间，默认为当前时间，不能为空
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // 用户更新时间，默认为当前时间，不能为空
  status: smallint('status').default(1).notNull(),
  // 用户状态，默认为1（激活），不能为空
  deletedAt: timestamp('deleted_at'),
  // 用户删除时间，可能为空，表示删除标记
  studentId: varchar('student_id', { length: 50 })
  // 学生ID，长度为50，允许为空，适用于学生角色
});

// 类型推导
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
