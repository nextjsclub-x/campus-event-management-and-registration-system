import { bigserial, timestamp, smallint, index, bigint, pgTable } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { activities } from './activity.schema';

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
