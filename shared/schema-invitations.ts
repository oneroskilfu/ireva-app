/**
 * Tenant Invitation Schema
 * 
 * This file defines the invitation system for the multi-tenant architecture.
 */

import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { tenants, tenantUsers } from './schema-tenants';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Tenant Invitations - Used to invite new users to join a tenant
 */
export const tenantInvitations = pgTable('tenant_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  invitedById: uuid('invited_by_id').references(() => tenantUsers.id),
  expires: timestamp('expires').notNull(),
  accepted: boolean('accepted').default(false),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Define relations
export const tenantInvitationsRelations = relations(tenantInvitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvitations.tenantId],
    references: [tenants.id],
  }),
  invitedBy: one(tenantUsers, {
    fields: [tenantInvitations.invitedById],
    references: [tenantUsers.id],
  }),
}));

// Zod schema for invitation validation
export const insertInvitationSchema = createInsertSchema(tenantInvitations)
  .omit({ 
    id: true, 
    token: true, 
    accepted: true, 
    acceptedAt: true, 
    createdAt: true 
  });

// Export types
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = z.infer<typeof insertInvitationSchema>;