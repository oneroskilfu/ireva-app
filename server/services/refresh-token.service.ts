import { db } from '../db';
import { refreshTokens, users } from '../../shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { generateRefreshToken } from '../utils/jwt';

export class RefreshTokenService {
  
  // Create a new refresh token for a user
  static async createRefreshToken(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
    const token = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await db.insert(refreshTokens).values({
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent
    });

    return token;
  }

  // Validate a refresh token and return user info if valid
  static async validateRefreshToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
    const tokenResult = await db
      .select({
        userId: refreshTokens.userId,
        isRevoked: refreshTokens.isRevoked,
        expiresAt: refreshTokens.expiresAt,
        userEmail: users.email,
        userRole: users.role,
        userIsActive: users.isActive
      })
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(
        and(
          eq(refreshTokens.token, token),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenResult.length === 0) {
      return null;
    }

    const tokenData = tokenResult[0];
    
    // Check if user is still active
    if (!tokenData.userIsActive) {
      await this.revokeRefreshToken(token);
      return null;
    }

    return {
      userId: tokenData.userId,
      email: tokenData.userEmail,
      role: tokenData.userRole
    };
  }

  // Revoke a specific refresh token
  static async revokeRefreshToken(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({
        isRevoked: true,
        revokedAt: new Date()
      })
      .where(eq(refreshTokens.token, token));
  }

  // Revoke all refresh tokens for a user (useful for logout all devices)
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await db
      .update(refreshTokens)
      .set({
        isRevoked: true,
        revokedAt: new Date()
      })
      .where(eq(refreshTokens.userId, userId));
  }

  // Clean up expired tokens (can be run as a scheduled job)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });

    return result.length;
  }

  // Get active token count for a user
  static async getUserActiveTokenCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: refreshTokens.id })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date())
        )
      );

    return result.length;
  }
}