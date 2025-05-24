/**
 * Invitation Schema
 * 
 * This file defines the database schema for tenant invitations.
 */

import { pgTable, uuid, text, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { tenants } from './schema-tenants';
import { users } from './schema';

/**
 * Invitations table
 * Stores invitations for users to join tenants
 */
export const invitations = pgTable('tenant_invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('user'),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'),
  invitedByUserId: integer('invited_by_user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  acceptedByUserId: integer('accepted_by_user_id').references(() => users.id),
  revokedAt: timestamp('revoked_at'),
  revokedByUserId: integer('revoked_by_user_id').references(() => users.id),
  resendCount: integer('resend_count').default(0).notNull(),
  lastResendAt: timestamp('last_resend_at'),
  lastResendByUserId: integer('last_resend_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    tokenIdx: uniqueIndex('invitation_token_idx').on(table.token),
    emailTenantIdx: uniqueIndex('invitation_email_tenant_idx').on(table.email, table.tenantId)
  };
});

/**
 * Relations
 */
export const invitationsRelations = relations(invitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invitations.tenantId],
    references: [tenants.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedByUserId],
    references: [users.id],
  }),
  acceptedBy: one(users, {
    fields: [invitations.acceptedByUserId],
    references: [users.id],
  }),
  revokedBy: one(users, {
    fields: [invitations.revokedByUserId],
    references: [users.id],
  }),
  lastResendBy: one(users, {
    fields: [invitations.lastResendByUserId],
    references: [users.id],
  }),
}));

/**
 * Schemas for validation
 */
export const insertInvitationSchema = createInsertSchema(invitations, {
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  status: z.enum(['pending', 'accepted', 'revoked', 'expired']).default('pending'),
});

export const selectInvitationSchema = createSelectSchema(invitations);

/**
 * Types
 */
export type Invitation = z.infer<typeof selectInvitationSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;