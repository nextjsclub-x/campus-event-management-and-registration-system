import { bigint, bigserial, pgTable, timestamp, varchar, text, integer, smallint, index } from 'drizzle-orm/pg-core';

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

// Users table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: smallint('status').default(1).notNull(),
});

// Activities table
export const activities = pgTable('activities', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  organizerId: bigint('organizer_id', { mode: 'number' }).notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  categoryId: bigint('category_id', { mode: 'number' }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  capacity: integer('capacity').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: smallint('status').default(1).notNull(),
}, (table) => ({
    organizerIdIdx: index('idx_activities_organizer_id').on(table.organizerId),
  }));

// Registrations table
export const registrations = pgTable('registrations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  activityId: bigint('activity_id', { mode: 'number' }).notNull().references(() => activities.id),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  status: smallint('status').default(1).notNull(),
}, (table) => ({
    userIdIdx: index('idx_registrations_user_id').on(table.userId),
    activityIdIdx: index('idx_registrations_activity_id').on(table.activityId),
  }));

// Notifications table
export const notifications = pgTable('notifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  activityId: bigint('activity_id', { mode: 'number' }).references(() => activities.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isRead: smallint('is_read').default(0).notNull(),
}, (table) => ({
    userIdIdx: index('idx_notifications_user_id').on(table.userId),
    activityIdIdx: index('idx_notifications_activity_id').on(table.activityId),
  }));

// Feedback table
export const feedback = pgTable('feedback', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  activityId: bigint('activity_id', { mode: 'number' }).notNull().references(() => activities.id),
  rating: smallint('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_feedback_user_id').on(table.userId),
    activityIdIdx: index('idx_feedback_activity_id').on(table.activityId),
  }));
