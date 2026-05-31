import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    fname: text('fname').notNull(),
    lname: text('lname').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    role: userRoleEnum('role').notNull().default('student'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_unique_idx').on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
