import { db } from '../db';
import { adminLogs } from '../../shared/schema';
import { Request } from 'express';

class AdminLogger {
  /**
   * Log an administrative action
   * 
   * @param adminId - The ID of the admin performing the action
   * @param action - The type of action (e.g., 'create_project', 'update_user', etc.)
   * @param description - A human-readable description of the action
   * @param metadata - Any additional metadata related to the action (optional)
   * @param req - The Express request object for capturing IP and user agent (optional)
   */
  static async logAction(
    adminId: number,
    action: string,
    description: string,
    metadata?: Record<string, any>,
    req?: Request
  ) {
    try {
      // Get IP and user agent from request if available
      const ip = req?.ip || null;
      const userAgent = req?.headers['user-agent'] || null;
      
      // Insert the log entry
      const [logEntry] = await db.insert(adminLogs).values({
        adminId,
        action,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ip,
        userAgent,
      }).returning();
      
      return logEntry;
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw, we don't want admin logging to break the main functionality
      return null;
    }
  }
  
  /**
   * Get logs for a specific admin
   * 
   * @param adminId - The ID of the admin
   * @param limit - Maximum number of logs to return (default: 100)
   * @param offset - Number of logs to skip (default: 0)
   */
  static async getLogsByAdmin(adminId: number, limit = 100, offset = 0) {
    try {
      const logs = await db.select()
        .from(adminLogs)
        .where(({ eq }) => eq(adminLogs.adminId, adminId))
        .orderBy(({ desc }) => [desc(adminLogs.createdAt)])
        .limit(limit)
        .offset(offset);
      
      return logs;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw error;
    }
  }
  
  /**
   * Get all admin logs
   * 
   * @param limit - Maximum number of logs to return (default: 100)
   * @param offset - Number of logs to skip (default: 0)
   */
  static async getAllLogs(limit = 100, offset = 0) {
    try {
      const logs = await db.select()
        .from(adminLogs)
        .orderBy(({ desc }) => [desc(adminLogs.createdAt)])
        .limit(limit)
        .offset(offset);
      
      return logs;
    } catch (error) {
      console.error('Error fetching all admin logs:', error);
      throw error;
    }
  }
  
  /**
   * Get logs for a specific action type
   * 
   * @param action - The action type to filter by
   * @param limit - Maximum number of logs to return (default: 100)
   * @param offset - Number of logs to skip (default: 0)
   */
  static async getLogsByAction(action: string, limit = 100, offset = 0) {
    try {
      const logs = await db.select()
        .from(adminLogs)
        .where(({ eq }) => eq(adminLogs.action, action))
        .orderBy(({ desc }) => [desc(adminLogs.createdAt)])
        .limit(limit)
        .offset(offset);
      
      return logs;
    } catch (error) {
      console.error('Error fetching logs by action:', error);
      throw error;
    }
  }
}

export default AdminLogger;