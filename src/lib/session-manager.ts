import { db } from '@/lib/db';
import { sessions, users, auditLogs } from '@/lib/db/schema';
import { eq, and, gt, lt, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { addHours, addDays, isAfter, isBefore, subHours, subDays } from 'date-fns';

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}

export interface SessionSecuritySettings {
  maxConcurrentSessions: number;
  sessionTimeoutHours: number;
  rememberMeDays: number;
  requireReauthAfterHours: number;
  suspiciousActivityThreshold: number;
  enableSessionMonitoring: boolean;
  enableAutomaticLogout: boolean;
}

export class SessionManager {
  private static instance: SessionManager;
  private securitySettings: SessionSecuritySettings = {
    maxConcurrentSessions: 5,
    sessionTimeoutHours: 24,
    rememberMeDays: 30,
    requireReauthAfterHours: 8,
    suspiciousActivityThreshold: 5,
    enableSessionMonitoring: true,
    enableAutomaticLogout: true
  };

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(
    userId: string,
    deviceInfo: string,
    ipAddress: string,
    userAgent: string,
    rememberMe = false
  ): Promise<string> {
    const sessionId = randomUUID();
    const now = new Date();
    const expiresAt = rememberMe 
      ? addDays(now, this.securitySettings.rememberMeDays)
      : addHours(now, this.securitySettings.sessionTimeoutHours);

    // Check concurrent session limit
    const activeSessions = await this.getUserActiveSessions(userId);
    if (activeSessions.length >= this.securitySettings.maxConcurrentSessions) {
      // Remove oldest session
      await this.terminateSession(activeSessions[0].id);
    }

    // Get location info (simplified - in production, use a proper IP geolocation service)
    const location = await this.getLocationFromIP(ipAddress);

    await db.insert(sessions).values({
      id: sessionId,
      userId,
      deviceInfo,
      ipAddress,
      location,
      userAgent,
      isActive: true,
      createdAt: now,
      expiresAt,
      lastActiveAt: now
    });

    // Log session creation
    await this.logSessionActivity(userId, sessionId, 'session_created', {
      deviceInfo,
      ipAddress,
      location,
      userAgent
    });

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!session.length) return false;

      const sessionData = session[0];
      const now = new Date();

      // Check if session is expired
      if (isAfter(now, sessionData.expiresAt)) {
        await this.terminateSession(sessionId);
        return false;
      }

      // Check if session is active
      if (!sessionData.isActive) {
        return false;
      }

      // Update last active time
      await db
        .update(sessions)
        .set({ lastActiveAt: now })
        .where(eq(sessions.id, sessionId));

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (session.length) {
        await this.logSessionActivity(session[0].userId, sessionId, 'session_terminated');
      }

      await db
        .update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.id, sessionId));

      return true;
    } catch (error) {
      console.error('Session termination error:', error);
      return false;
    }
  }

  async terminateAllUserSessions(userId: string, exceptSessionId?: string): Promise<boolean> {
    try {
      const userSessions = await this.getUserActiveSessions(userId);
      
      for (const session of userSessions) {
        if (session.id !== exceptSessionId) {
          await this.terminateSession(session.id);
        }
      }

      await this.logSessionActivity(userId, 'all_sessions_terminated', 'multiple_sessions_terminated', {
        exceptSessionId,
        terminatedCount: userSessions.length - (exceptSessionId ? 1 : 0)
      });

      return true;
    } catch (error) {
      console.error('Terminate all sessions error:', error);
      return false;
    }
  }

  async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    const now = new Date();
    const userSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isActive, true),
          gt(sessions.expiresAt, now)
        )
      )
      .orderBy(desc(sessions.lastActiveAt));

    return userSessions.map(session => ({
      id: session.id,
      userId: session.userId,
      deviceInfo: session.deviceInfo || 'Unknown Device',
      ipAddress: session.ipAddress || 'Unknown IP',
      location: session.location,
      userAgent: session.userAgent || 'Unknown User Agent',
      isActive: session.isActive,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActiveAt: session.lastActiveAt
    }));
  }

  async getAllActiveSessions(): Promise<SessionInfo[]> {
    const now = new Date();
    const activeSessions = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        deviceInfo: sessions.deviceInfo,
        ipAddress: sessions.ipAddress,
        location: sessions.location,
        userAgent: sessions.userAgent,
        isActive: sessions.isActive,
        createdAt: sessions.createdAt,
        expiresAt: sessions.expiresAt,
        lastActiveAt: sessions.lastActiveAt
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.isActive, true),
          gt(sessions.expiresAt, now)
        )
      )
      .orderBy(desc(sessions.lastActiveAt));

    return activeSessions;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(sessions)
      .set({ isActive: false })
      .where(
        and(
          eq(sessions.isActive, true),
          lt(sessions.expiresAt, now)
        )
      );

    return result.length;
  }

  async detectSuspiciousActivity(userId: string, sessionId: string, ipAddress: string): Promise<boolean> {
    try {
      // Get recent sessions for the user
      const recentSessions = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            gt(sessions.createdAt, subDays(new Date(), 7))
          )
        );

      // Check for IP changes
      const ipChanges = recentSessions.filter(session => session.ipAddress !== ipAddress);
      if (ipChanges.length >= this.securitySettings.suspiciousActivityThreshold) {
        await this.logSessionActivity(userId, sessionId, 'suspicious_ip_change', {
          currentIp: ipAddress,
          previousIps: ipChanges.map(s => s.ipAddress)
        });
        return true;
      }

      // Check for rapid session creation
      const recentSessionCreations = recentSessions.filter(session => 
        isAfter(session.createdAt, subHours(new Date(), 1))
      );
      if (recentSessionCreations.length >= 3) {
        await this.logSessionActivity(userId, sessionId, 'rapid_session_creation', {
          sessionCount: recentSessionCreations.length
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Suspicious activity detection error:', error);
      return false;
    }
  }

  async updateSecuritySettings(settings: Partial<SessionSecuritySettings>): Promise<void> {
    this.securitySettings = { ...this.securitySettings, ...settings };
  }

  getSecuritySettings(): SessionSecuritySettings {
    return { ...this.securitySettings };
  }

  private async getLocationFromIP(ipAddress: string): Promise<string> {
    // Simplified location detection - in production, use a proper IP geolocation service
    try {
      if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
        return 'Localhost';
      }
      
      // Basic IP range detection (very simplified)
      if (ipAddress.startsWith('192.168.')) {
        return 'Private Network';
      }
      
      if (ipAddress.startsWith('10.')) {
        return 'Private Network';
      }
      
      return 'Unknown Location';
    } catch (error) {
      console.error('Location detection error:', error);
      return 'Unknown Location';
    }
  }

  private async logSessionActivity(
    userId: string,
    sessionId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId,
        action,
        resourceType: 'session',
        resourceId: sessionId,
        metadata: metadata || {},
        ipAddress: 'system',
        userAgent: 'session-manager',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Session activity logging error:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();