import { relations, sql } from 'drizzle-orm';
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  boolean,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { users } from './schema';

/**
 * Entity Change History Schema
 * 
 * Tracks all changes to important entities in the system.
 * Stores the previous and new state of entities for auditing and rollback functionality.
 */

// Entity types that we track changes for
export type EntityType = 
  | 'user'
  | 'property'
  | 'investment'
  | 'transaction'
  | 'kyc'
  | 'document'
  | 'property_update'
  | 'roi_payment'
  | 'wallet';

// Change types
export type ChangeType = 
  | 'create' 
  | 'update' 
  | 'delete';

// Entity version history table
export const entityHistory = pgTable('entity_history', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // The type of entity
  entityId: integer('entity_id').notNull(), // The ID of the entity
  changeType: varchar('change_type', { length: 20 }).notNull(), // Type of change: create, update, delete
  previousState: jsonb('previous_state'), // State before change (null for create)
  newState: jsonb('new_state'), // State after change (null for delete)
  changedBy: integer('changed_by').references(() => users.id), // User who made the change
  changedAt: timestamp('changed_at').defaultNow().notNull(), // When the change was made
  reason: text('reason'), // Optional reason for the change
  ipAddress: varchar('ip_address', { length: 45 }), // IP address of the user
  userAgent: text('user_agent'), // User agent of the client
  additionalInfo: jsonb('additional_info'), // Any additional information about the change
});

// Entity field change history table
// More granular tracking of which specific fields were changed
export const fieldChangeHistory = pgTable('field_change_history', {
  id: serial('id').primaryKey(),
  entityHistoryId: integer('entity_history_id').notNull().references(() => entityHistory.id),
  fieldName: varchar('field_name', { length: 100 }).notNull(), // Name of the field that changed
  previousValue: jsonb('previous_value'), // Value before change
  newValue: jsonb('new_value'), // Value after change
});

// Admin action history table
// Specifically for tracking administrative actions
export const adminActionHistory = pgTable('admin_action_history', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => users.id),
  actionType: varchar('action_type', { length: 100 }).notNull(), // Type of action performed
  entityType: varchar('entity_type', { length: 50 }), // Optional entity type
  entityId: integer('entity_id'), // Optional entity ID
  details: jsonb('details'), // Details of the action
  performedAt: timestamp('performed_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  success: boolean('success').default(true).notNull(), // Was the action successful
  affectedUserIds: integer('affected_user_id').array(), // Array of user IDs affected by the action
});

// Define relations for entity history
export const entityHistoryRelations = relations(entityHistory, ({ one }) => ({
  changedByUser: one(users, {
    fields: [entityHistory.changedBy],
    references: [users.id],
  }),
}));

// Define relations for admin action history
export const adminActionHistoryRelations = relations(adminActionHistory, ({ one }) => ({
  admin: one(users, {
    fields: [adminActionHistory.adminId],
    references: [users.id],
  }),
}));

// Create composite unique index on entity_id and entity_type for faster lookups
/*
CREATE UNIQUE INDEX IF NOT EXISTS entity_history_lookup_idx 
ON entity_history(entity_type, entity_id, changed_at DESC);
*/

// Define types for TypeScript
export type EntityHistory = typeof entityHistory.$inferSelect;
export type FieldChangeHistory = typeof fieldChangeHistory.$inferSelect;
export type AdminActionHistory = typeof adminActionHistory.$inferSelect;