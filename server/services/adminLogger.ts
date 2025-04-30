import { db } from '../db';
import { adminLogs, auditLogs } from '@shared/schema';

interface AdminLogData {
  adminId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogData {
  action: any;
  targetId: string;
  entityType: string;
  adminId?: string;
  ip?: string;
  metadata?: Record<string, any>;
  details?: string;
  status?: string;
}

export async function createAdminLog(data: AdminLogData) {
  return db.insert(adminLogs).values(data).returning();
}

export async function createAuditLog(data: AuditLogData) {
  return db.insert(auditLogs).values(data).returning();
}

export default {
  createAdminLog,
  createAuditLog
};