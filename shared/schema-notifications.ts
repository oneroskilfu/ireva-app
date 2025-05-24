import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  boolean, 
  timestamp, 
  integer, 
  json, 
  primaryKey 
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Notifications Schema
 * 
 * Defines the database structure for storing user notifications
 * with comprehensive details and delivery tracking
 */

// Notification priority enum
export const NotificationPriorityEnum = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;

// Notification delivery status enum
export const NotificationDeliveryStatusEnum = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  PARTIAL: 'partial',
  SCHEDULED: 'scheduled',
} as const;

// Notification types enum
export const NotificationTypeEnum = {
  INVESTMENT: 'investment',
  ROI: 'roi',
  KYC: 'kyc',
  WALLET: 'wallet',
  SYSTEM: 'system',
} as const;

// Notification channel enum
export const NotificationChannelEnum = {
  EMAIL: 'email',
  IN_APP: 'in-app', 
  SMS: 'sms',
} as const;

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().$type<keyof typeof NotificationTypeEnum>(),
  priority: text('priority').notNull().default(NotificationPriorityEnum.NORMAL).$type<keyof typeof NotificationPriorityEnum>(),
  data: json('data'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  deliveryStatus: text('delivery_status').notNull().default(NotificationDeliveryStatusEnum.PENDING)
    .$type<keyof typeof NotificationDeliveryStatusEnum>(),
  deliveredAt: timestamp('delivered_at'),
  sentVia: text('sent_via'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Notification Templates table
export const notificationTemplates = pgTable('notification_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  type: text('type').notNull().$type<keyof typeof NotificationTypeEnum>(),
  title: text('title').notNull(),
  emailSubject: text('email_subject'),
  emailTemplate: text('email_template'),
  smsTemplate: text('sms_template'),
  inAppTemplate: text('in_app_template'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User notification preferences
export const userNotificationPreferences = pgTable('user_notification_preferences', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channelEmail: boolean('channel_email').notNull().default(true),
  channelInApp: boolean('channel_in_app').notNull().default(true),
  channelSms: boolean('channel_sms').notNull().default(false),
  typeInvestment: boolean('type_investment').notNull().default(true),
  typeRoi: boolean('type_roi').notNull().default(true),
  typeKyc: boolean('type_kyc').notNull().default(true),
  typeWallet: boolean('type_wallet').notNull().default(true),
  typeSystem: boolean('type_system').notNull().default(true),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});

// Scheduled notification queue
export const scheduledNotifications = pgTable('scheduled_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().$type<keyof typeof NotificationTypeEnum>(),
  data: json('data'),
  channels: text('channels').notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  processed: boolean('processed').notNull().default(false),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Define relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const userNotificationPreferencesRelations = relations(userNotificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPreferences.userId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, readAt: true, deliveredAt: true, createdAt: true })
  .extend({
    data: z.record(z.any()).optional(),
  });

export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    emailTemplate: z.string().optional(),
    smsTemplate: z.string().optional(),
    inAppTemplate: z.string().optional(),
  });

export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences)
  .omit({ updatedAt: true });

export const insertScheduledNotificationSchema = createInsertSchema(scheduledNotifications)
  .omit({ id: true, processed: true, processedAt: true, createdAt: true })
  .extend({
    data: z.record(z.any()).optional(),
  });

// Types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;

export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type InsertUserNotificationPreference = z.infer<typeof insertUserNotificationPreferencesSchema>;

export type ScheduledNotification = typeof scheduledNotifications.$inferSelect;
export type InsertScheduledNotification = z.infer<typeof insertScheduledNotificationSchema>;