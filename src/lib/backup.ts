import { db } from '@/lib/db';
import { auditLogger } from '@/lib/audit-logger';

export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    users: any[];
    licenses: any[];
    devices: any[];
    creditTransactions: any[];
    tickets: any[];
    notifications: any[];
    news: any[];
    downloads: any[];
    payments: any[];
    activityLogs: any[];
  };
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  size: number;
  checksum: string;
}

export class BackupService {
  static async createBackup(adminUserId: string): Promise<BackupInfo> {
    try {
      // Get all data from the database
      const [
        users,
        licenses,
        devices,
        creditTransactions,
        tickets,
        notifications,
        news,
        downloads,
        payments,
        activityLogs
      ] = await Promise.all([
        db.user.findMany(),
        db.license.findMany(),
        db.device.findMany(),
        db.creditTransaction.findMany(),
        db.ticket.findMany({
          include: {
            replies: true
          }
        }),
        db.notification.findMany(),
        db.news.findMany(),
        db.download.findMany(),
        db.payment.findMany(),
        db.activityLog.findMany()
      ]);

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          users,
          licenses,
          devices,
          creditTransactions,
          tickets,
          notifications,
          news,
          downloads,
          payments,
          activityLogs
        }
      };

      // Convert to JSON string
      const backupJson = JSON.stringify(backupData, null, 2);
      
      // Create checksum
      const crypto = await import('crypto');
      const checksum = crypto.createHash('sha256').update(backupJson).digest('hex');

      // Store backup in database
      const backup = await db.backup.create({
        data: {
          timestamp: new Date(),
          size: Buffer.byteLength(backupJson, 'utf8'),
          checksum,
          data: backupJson
        }
      });

      // Log the backup action
      await auditLogger.logAction(adminUserId, 'BACKUP_CREATE', {
        backupId: backup.id,
        timestamp: backup.timestamp.toISOString(),
        size: backup.size,
        checksum: backup.checksum
      });

      return {
        id: backup.id,
        timestamp: backup.timestamp,
        size: backup.size,
        checksum: backup.checksum
      };
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  static async getBackupList(): Promise<BackupInfo[]> {
    try {
      const backups = await db.backup.findMany({
        orderBy: {
          timestamp: 'desc'
        },
        select: {
          id: true,
          timestamp: true,
          size: true,
          checksum: true
        }
      });

      return backups;
    } catch (error) {
      console.error('Failed to fetch backup list:', error);
      throw new Error('Failed to fetch backup list');
    }
  }

  static async getBackup(backupId: string): Promise<BackupData | null> {
    try {
      const backup = await db.backup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        return null;
      }

      return JSON.parse(backup.data);
    } catch (error) {
      console.error('Failed to fetch backup:', error);
      throw new Error('Failed to fetch backup');
    }
  }

  static async deleteBackup(backupId: string, adminUserId: string): Promise<void> {
    try {
      await db.backup.delete({
        where: { id: backupId }
      });

      // Log the deletion
      await auditLogger.logAction(adminUserId, 'BACKUP_DELETE', {
        backupId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw new Error('Failed to delete backup');
    }
  }

  static async restoreBackup(backupId: string, adminUserId: string): Promise<void> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Verify backup integrity
      const backupJson = JSON.stringify(backup, null, 2);
      const crypto = await import('crypto');
      const calculatedChecksum = crypto.createHash('sha256').update(backupJson).digest('hex');
      
      const storedBackup = await db.backup.findUnique({
        where: { id: backupId }
      });

      if (!storedBackup || calculatedChecksum !== storedBackup.checksum) {
        throw new Error('Backup integrity check failed');
      }

      // Log the restore action
      await auditLogger.logAction(adminUserId, 'BACKUP_RESTORE', {
        backupId,
        timestamp: new Date().toISOString(),
        backupTimestamp: backup.timestamp
      });

      // Restore data (this is a simplified version - in production you'd want more sophisticated handling)
      await this.restoreData(backup.data);

    } catch (error) {
      console.error('Backup restore failed:', error);
      throw new Error('Failed to restore backup');
    }
  }

  private static async restoreData(data: BackupData['data']) {
    // This is a simplified restore process
    // In production, you'd want to handle conflicts, foreign keys, etc. more carefully
    
    // Clear existing data (in reverse order of dependencies)
    await db.notification.deleteMany();
    await db.ticketReply.deleteMany();
    await db.ticket.deleteMany();
    await db.creditTransaction.deleteMany();
    await db.payment.deleteMany();
    await db.activityLog.deleteMany();
    await db.download.deleteMany();
    await db.device.deleteMany();
    await db.license.deleteMany();
    await db.user.deleteMany();
    await db.news.deleteMany();

    // Restore data
    await db.news.createMany({
      data: data.news
    });

    await db.user.createMany({
      data: data.users
    });

    await db.license.createMany({
      data: data.licenses
    });

    await db.device.createMany({
      data: data.devices
    });

    await db.creditTransaction.createMany({
      data: data.creditTransactions
    });

    await db.payment.createMany({
      data: data.payments
    });

    await db.download.createMany({
      data: data.downloads
    });

    await db.activityLog.createMany({
      data: data.activityLogs
    });

    // Restore tickets and replies
    for (const ticket of data.tickets) {
      const { replies, ...ticketData } = ticket;
      await db.ticket.create({
        data: ticketData
      });
      
      if (replies && replies.length > 0) {
        await db.ticketReply.createMany({
          data: replies.map(reply => ({
            ...reply,
            ticketId: ticketData.id
          }))
        });
      }
    }

    await db.notification.createMany({
      data: data.notifications
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}