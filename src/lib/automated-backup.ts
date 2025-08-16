import { db } from './db';
import { AuditLogger } from './audit-logger';
import { systemMonitor } from './system-monitor';

export interface BackupConfig {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  retention: number; // days to keep backups
  compression: boolean;
  encryption: boolean;
  destination: 'local' | 's3' | 'gcs' | 'azure';
  destinationConfig: Record<string, any>;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'error';
}

export interface BackupJob {
  id: string;
  configId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  size?: number;
  fileCount?: number;
  checksum?: string;
  location?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BackupVerification {
  id: string;
  backupJobId: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime: Date;
  endTime?: Date;
  checks: {
    integrity: boolean;
    size: boolean;
    checksum: boolean;
    restore: boolean;
  };
  error?: string;
  details?: Record<string, any>;
}

class AutomatedBackupSystem {
  private configs: Map<string, BackupConfig> = new Map();
  private jobs: Map<string, BackupJob> = new Map();
  private verifications: Map<string, BackupVerification> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.initializeDefaultConfigs();
    this.startScheduler();
  }

  private initializeDefaultConfigs() {
    // Default database backup configuration
    const dbBackupConfig: BackupConfig = {
      id: 'default-database-backup',
      name: 'Database Daily Backup',
      type: 'database',
      schedule: 'daily',
      enabled: true,
      retention: 30,
      compression: true,
      encryption: true,
      destination: 'local',
      destinationConfig: {
        path: './backups/database',
      },
      status: 'active',
      nextRun: this.getNextRunTime('daily'),
    };

    // Default full backup configuration
    const fullBackupConfig: BackupConfig = {
      id: 'default-full-backup',
      name: 'Full System Weekly Backup',
      type: 'full',
      schedule: 'weekly',
      enabled: true,
      retention: 90,
      compression: true,
      encryption: true,
      destination: 'local',
      destinationConfig: {
        path: './backups/full',
      },
      status: 'active',
      nextRun: this.getNextRunTime('weekly'),
    };

    this.configs.set(dbBackupConfig.id, dbBackupConfig);
    this.configs.set(fullBackupConfig.id, fullBackupConfig);
  }

  private getNextRunTime(schedule: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        next.setMinutes(0, 0, 0);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0); // 2 AM
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - now.getDay()));
        next.setHours(2, 0, 0, 0); // 2 AM on Sunday
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(2, 0, 0, 0); // 2 AM on 1st of month
        break;
      default:
        next.setHours(next.getHours() + 1);
    }

    return next;
  }

  private startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check for due backups every minute
    this.schedulerInterval = setInterval(async () => {
      await this.checkAndRunDueBackups();
      await this.cleanupOldBackups();
      await this.scheduleVerifications();
    }, 60 * 1000);

    console.log('Automated backup system started');
  }

  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    console.log('Automated backup system stopped');
  }

  private async checkAndRunDueBackups() {
    const now = new Date();
    
    for (const config of this.configs.values()) {
      if (!config.enabled || config.status !== 'active') continue;
      
      if (config.nextRun && now >= config.nextRun) {
        await this.runBackup(config);
      }
    }
  }

  private async runBackup(config: BackupConfig): Promise<BackupJob> {
    const job: BackupJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configId: config.id,
      status: 'pending',
      startTime: new Date(),
    };

    this.jobs.set(job.id, job);

    try {
      // Update job status to running
      job.status = 'running';
      await this.logBackupEvent('BACKUP_STARTED', { configId: config.id, jobId: job.id });

      // Execute backup based on type
      let backupResult;
      switch (config.type) {
        case 'database':
          backupResult = await this.backupDatabase(config);
          break;
        case 'full':
          backupResult = await this.backupFull(config);
          break;
        case 'incremental':
          backupResult = await this.backupIncremental(config);
          break;
        case 'files':
          backupResult = await this.backupFiles(config);
          break;
        default:
          throw new Error(`Unknown backup type: ${config.type}`);
      }

      // Update job with results
      job.status = 'completed';
      job.endTime = new Date();
      job.size = backupResult.size;
      job.fileCount = backupResult.fileCount;
      job.checksum = backupResult.checksum;
      job.location = backupResult.location;
      job.metadata = backupResult.metadata;

      // Update config
      config.lastRun = job.endTime;
      config.nextRun = this.getNextRunTime(config.schedule);

      await this.logBackupEvent('BACKUP_COMPLETED', {
        configId: config.id,
        jobId: job.id,
        size: backupResult.size,
        fileCount: backupResult.fileCount,
        duration: job.endTime.getTime() - job.startTime.getTime(),
      });

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.error = error instanceof Error ? error.message : 'Unknown error';
      
      config.status = 'error';
      
      await this.logBackupEvent('BACKUP_FAILED', {
        configId: config.id,
        jobId: job.id,
        error: job.error,
      });
    }

    return job;
  }

  private async backupDatabase(config: BackupConfig) {
    // Simulated database backup
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const size = Math.floor(Math.random() * 1000000000); // Random size up to 1GB
    const checksum = this.generateChecksum();
    
    return {
      size,
      fileCount: 1,
      checksum,
      location: `${config.destinationConfig.path}/backup_${Date.now()}.sql`,
      metadata: {
        type: 'database',
        compression: config.compression,
        encryption: config.encryption,
      },
    };
  }

  private async backupFull(config: BackupConfig) {
    // Simulated full system backup
    await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 20000));
    
    const size = Math.floor(Math.random() * 5000000000); // Random size up to 5GB
    const fileCount = Math.floor(Math.random() * 1000) + 100;
    const checksum = this.generateChecksum();
    
    return {
      size,
      fileCount,
      checksum,
      location: `${config.destinationConfig.path}/full_backup_${Date.now()}.tar.gz`,
      metadata: {
        type: 'full',
        compression: config.compression,
        encryption: config.encryption,
      },
    };
  }

  private async backupIncremental(config: BackupConfig) {
    // Simulated incremental backup
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
    
    const size = Math.floor(Math.random() * 500000000); // Random size up to 500MB
    const fileCount = Math.floor(Math.random() * 100) + 10;
    const checksum = this.generateChecksum();
    
    return {
      size,
      fileCount,
      checksum,
      location: `${config.destinationConfig.path}/incremental_backup_${Date.now()}.tar.gz`,
      metadata: {
        type: 'incremental',
        compression: config.compression,
        encryption: config.encryption,
      },
    };
  }

  private async backupFiles(config: BackupConfig) {
    // Simulated files backup
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000));
    
    const size = Math.floor(Math.random() * 2000000000); // Random size up to 2GB
    const fileCount = Math.floor(Math.random() * 500) + 50;
    const checksum = this.generateChecksum();
    
    return {
      size,
      fileCount,
      checksum,
      location: `${config.destinationConfig.path}/files_backup_${Date.now()}.tar.gz`,
      metadata: {
        type: 'files',
        compression: config.compression,
        encryption: config.encryption,
      },
    };
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async cleanupOldBackups() {
    const now = new Date();
    
    for (const config of this.configs.values()) {
      if (!config.enabled) continue;
      
      const cutoffDate = new Date(now.getTime() - config.retention * 24 * 60 * 60 * 1000);
      
      // Remove old jobs from memory (in production, this would delete actual files)
      for (const [jobId, job] of this.jobs.entries()) {
        if (job.configId === config.id && job.startTime < cutoffDate) {
          this.jobs.delete(jobId);
          
          // Remove associated verifications
          for (const [verId, ver] of this.verifications.entries()) {
            if (ver.backupJobId === jobId) {
              this.verifications.delete(verId);
            }
          }
        }
      }
    }
  }

  private async scheduleVerifications() {
    // Schedule verification for recent successful backups
    const recentJobs = Array.from(this.jobs.values()).filter(job => 
      job.status === 'completed' && 
      !Array.from(this.verifications.values()).some(ver => ver.backupJobId === job.id)
    );

    for (const job of recentJobs.slice(-5)) { // Verify last 5 successful backups
      if (Math.random() > 0.7) { // 30% chance to verify
        await this.runVerification(job);
      }
    }
  }

  private async runVerification(job: BackupJob): Promise<BackupVerification> {
    const verification: BackupVerification = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      backupJobId: job.id,
      status: 'pending',
      startTime: new Date(),
      checks: {
        integrity: false,
        size: false,
        checksum: false,
        restore: false,
      },
    };

    this.verifications.set(verification.id, verification);

    try {
      verification.status = 'running';
      await this.logBackupEvent('VERIFICATION_STARTED', { jobId: job.id, verificationId: verification.id });

      // Simulated verification process
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Perform verification checks
      verification.checks.integrity = Math.random() > 0.1; // 90% pass rate
      verification.checks.size = Math.random() > 0.05; // 95% pass rate
      verification.checks.checksum = Math.random() > 0.05; // 95% pass rate
      verification.checks.restore = Math.random() > 0.1; // 90% pass rate

      verification.status = 'passed';
      verification.endTime = new Date();
      verification.details = {
        duration: verification.endTime.getTime() - verification.startTime.getTime(),
        checksPerformed: Object.keys(verification.checks).length,
        checksPassed: Object.values(verification.checks).filter(Boolean).length,
      };

      await this.logBackupEvent('VERIFICATION_COMPLETED', {
        jobId: job.id,
        verificationId: verification.id,
        status: verification.status,
        checks: verification.checks,
      });

    } catch (error) {
      verification.status = 'failed';
      verification.endTime = new Date();
      verification.error = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logBackupEvent('VERIFICATION_FAILED', {
        jobId: job.id,
        verificationId: verification.id,
        error: verification.error,
      });
    }

    return verification;
  }

  private async logBackupEvent(action: string, data: Record<string, any>) {
    await AuditLogger.log(action, {
      ...data,
      timestamp: new Date().toISOString(),
      system: 'backup',
    });
  }

  // Public methods for management
  addConfig(config: Omit<BackupConfig, 'id' | 'nextRun' | 'status'>): BackupConfig {
    const newConfig: BackupConfig = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextRun: this.getNextRunTime(config.schedule),
      status: 'active',
    };

    this.configs.set(newConfig.id, newConfig);
    
    this.logBackupEvent('CONFIG_ADDED', { configId: newConfig.id });
    
    return newConfig;
  }

  updateConfig(configId: string, updates: Partial<BackupConfig>): BackupConfig | null {
    const config = this.configs.get(configId);
    if (!config) return null;

    const updatedConfig = { ...config, ...updates };
    this.configs.set(configId, updatedConfig);
    
    this.logBackupEvent('CONFIG_UPDATED', { configId, updates });
    
    return updatedConfig;
  }

  deleteConfig(configId: string): boolean {
    const deleted = this.configs.delete(configId);
    if (deleted) {
      this.logBackupEvent('CONFIG_DELETED', { configId });
    }
    return deleted;
  }

  getConfigs(): BackupConfig[] {
    return Array.from(this.configs.values());
  }

  getJobs(configId?: string): BackupJob[] {
    const jobs = Array.from(this.jobs.values());
    return configId ? jobs.filter(job => job.configId === configId) : jobs;
  }

  getVerifications(jobId?: string): BackupVerification[] {
    const verifications = Array.from(this.verifications.values());
    return jobId ? verifications.filter(ver => ver.backupJobId === jobId) : verifications;
  }

  runBackupNow(configId: string): Promise<BackupJob> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Backup config not found: ${configId}`);
    }
    
    return this.runBackup(config);
  }

  getBackupStats() {
    const jobs = Array.from(this.jobs.values());
    const verifications = Array.from(this.verifications.values());
    
    return {
      totalConfigs: this.configs.size,
      enabledConfigs: Array.from(this.configs.values()).filter(c => c.enabled).length,
      totalJobs: jobs.length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      totalVerifications: verifications.length,
      passedVerifications: verifications.filter(v => v.status === 'passed').length,
      failedVerifications: verifications.filter(v => v.status === 'failed').length,
      totalSize: jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.size || 0), 0),
      lastBackup: jobs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0],
    };
  }
}

// Global instance
export const automatedBackupSystem = new AutomatedBackupSystem();

// Export for testing
export { AutomatedBackupSystem };