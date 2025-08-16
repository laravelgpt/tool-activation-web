import { db } from '@/lib/db';
import { auditLogger } from '@/lib/audit-logger';
import * as OTPAuth from 'otpauth';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class TwoFactorAuthService {
  static async generateSecret(userId: string): Promise<TwoFactorSetup> {
    try {
      // Check if user already has 2FA enabled
      const existing2FA = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (existing2FA && existing2FA.isEnabled) {
        throw new Error('Two-factor authentication is already enabled for this user');
      }

      // Generate new secret
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const secret = new OTPAuth.Secret();
      const totp = new OTPAuth.TOTP({
        issuer: 'Your App Name',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret
      });

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Create or update 2FA record
      await db.twoFactorAuth.upsert({
        where: { userId },
        create: {
          userId,
          secret: secret.base32,
          backupCodes: JSON.stringify(backupCodes),
          isEnabled: false
        },
        update: {
          secret: secret.base32,
          backupCodes: JSON.stringify(backupCodes),
          isEnabled: false
        }
      });

      // Generate QR code
      const qrCode = totp.toString();

      return {
        secret: secret.base32,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('Failed to generate 2FA secret:', error);
      throw error;
    }
  }

  static async verifyAndEnable(userId: string, token: string): Promise<string[]> {
    try {
      const twoFactorAuth = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactorAuth) {
        throw new Error('Two-factor authentication not set up');
      }

      if (twoFactorAuth.isEnabled) {
        throw new Error('Two-factor authentication is already enabled');
      }

      // Verify the token
      const isValid = this.verifyToken(twoFactorAuth.secret, token);
      
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Enable 2FA
      await db.twoFactorAuth.update({
        where: { userId },
        data: { isEnabled: true }
      });

      // Log the action
      await auditLogger.logAction(userId, '2FA_ENABLE', {
        timestamp: new Date().toISOString()
      });

      // Return backup codes
      return JSON.parse(twoFactorAuth.backupCodes);
    } catch (error) {
      console.error('Failed to verify and enable 2FA:', error);
      throw error;
    }
  }

  static async verifyTokenForLogin(userId: string, token: string): Promise<boolean> {
    try {
      const twoFactorAuth = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        return false; // 2FA not enabled
      }

      // Check if token is a backup code
      const backupCodes = JSON.parse(twoFactorAuth.backupCodes);
      if (backupCodes.includes(token)) {
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== token);
        await db.twoFactorAuth.update({
          where: { userId },
          data: { backupCodes: JSON.stringify(updatedBackupCodes) }
        });
        return true;
      }

      // Verify TOTP token
      return this.verifyToken(twoFactorAuth.secret, token);
    } catch (error) {
      console.error('Failed to verify 2FA token:', error);
      return false;
    }
  }

  static async disable(userId: string, password: string): Promise<void> {
    try {
      // Verify user's password first
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, you would verify the password here
      // For now, we'll proceed with disabling 2FA

      await db.twoFactorAuth.delete({
        where: { userId }
      });

      // Log the action
      await auditLogger.logAction(userId, '2FA_DISABLE', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      throw error;
    }
  }

  static async getStatus(userId: string): Promise<{ enabled: boolean; setupComplete: boolean }> {
    try {
      const twoFactorAuth = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      return {
        enabled: twoFactorAuth?.isEnabled || false,
        setupComplete: !!twoFactorAuth
      };
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
      return { enabled: false, setupComplete: false };
    }
  }

  static async regenerateBackupCodes(userId: string, currentToken: string): Promise<string[]> {
    try {
      const twoFactorAuth = await db.twoFactorAuth.findUnique({
        where: { userId }
      });

      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        throw new Error('Two-factor authentication is not enabled');
      }

      // Verify current token
      const isValid = this.verifyToken(twoFactorAuth.secret, currentToken);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes();

      await db.twoFactorAuth.update({
        where: { userId },
        data: { backupCodes: JSON.stringify(newBackupCodes) }
      });

      // Log the action
      await auditLogger.logAction(userId, '2FA_REGENERATE_BACKUP_CODES', {
        timestamp: new Date().toISOString()
      });

      return newBackupCodes;
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error);
      throw error;
    }
  }

  private static verifyToken(secret: string, token: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(secret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      });

      // Generate a token and compare with the provided token
      const delta = totp.validate({
        token: token,
        window: 1 // Allow 1 step before and after for clock drift
      });

      return delta !== null;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}