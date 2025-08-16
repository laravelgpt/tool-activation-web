import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface DeviceInfo {
  hwid?: string;
  ip?: string;
  mac?: string;
}

export interface LicenseCreateInput {
  userId: string;
  type: 'TRIAL' | 'STANDARD' | 'PRO';
  deviceInfo?: DeviceInfo;
  expiresAt?: Date;
  usageLimit?: number;
}

export async function generateLicenseKey(): Promise<string> {
  const prefix = 'ULT-';
  const randomPart = uuidv4().toUpperCase().replace(/-/g, '').substring(0, 16);
  return `${prefix}${randomPart}`;
}

export async function createLicense(input: LicenseCreateInput) {
  const key = await generateLicenseKey();
  
  const license = await db.license.create({
    data: {
      key,
      userId: input.userId,
      type: input.type,
      deviceInfo: input.deviceInfo || {},
      expiresAt: input.expiresAt,
      usageLimit: input.usageLimit || getDefaultUsageLimit(input.type),
    },
  });

  return license;
}

export function getDefaultUsageLimit(type: 'TRIAL' | 'STANDARD' | 'PRO'): number {
  switch (type) {
    case 'TRIAL':
      return 10;
    case 'STANDARD':
      return 100;
    case 'PRO':
      return 1000;
    default:
      return 0;
  }
}

export async function validateLicense(key: string, deviceInfo?: DeviceInfo) {
  const license = await db.license.findUnique({
    where: { key },
    include: {
      user: true,
    },
  });

  if (!license) {
    return { valid: false, reason: 'License not found' };
  }

  if (!license.active) {
    return { valid: false, reason: 'License is inactive' };
  }

  if (license.expiresAt && new Date() > license.expiresAt) {
    return { valid: false, reason: 'License has expired' };
  }

  if (license.usageLimit > 0 && license.usageCount >= license.usageLimit) {
    return { valid: false, reason: 'Usage limit reached' };
  }

  if (license.deviceInfo && Object.keys(license.deviceInfo).length > 0) {
    if (deviceInfo && license.deviceInfo.hwid && deviceInfo.hwid !== license.deviceInfo.hwid) {
      return { valid: false, reason: 'Device HWID mismatch' };
    }
  }

  return { valid: true, license };
}

export async function activateLicense(key: string, deviceInfo: DeviceInfo, ip?: string) {
  const validation = await validateLicense(key, deviceInfo);
  
  if (!validation.valid) {
    return validation;
  }

  const license = validation.license!;

  await db.license.update({
    where: { id: license.id },
    data: {
      deviceInfo: deviceInfo,
      lastUsedAt: new Date(),
      usageCount: {
        increment: 1,
      },
    },
  });

  await db.activationLog.create({
    data: {
      userId: license.userId,
      licenseId: license.id,
      ip,
      hwid: deviceInfo.hwid,
      action: 'UNLOCK',
      result: 'SUCCESS',
    },
  });

  return { valid: true, license };
}

export async function deactivateLicense(key: string) {
  const license = await db.license.findUnique({
    where: { key },
  });

  if (!license) {
    return { success: false, reason: 'License not found' };
  }

  await db.license.update({
    where: { id: license.id },
    data: {
      active: false,
    },
  });

  return { success: true };
}

export async function getUserLicenses(userId: string) {
  return await db.license.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLicenseByKey(key: string) {
  return await db.license.findUnique({
    where: { key },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function getActivationLogs(userId?: string, licenseId?: string, limit = 50) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (licenseId) where.licenseId = licenseId;

  return await db.activationLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      license: {
        select: {
          id: true,
          key: true,
          type: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}