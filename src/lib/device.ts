import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface DeviceInfo {
  hwid: string;
  ip?: string;
  mac?: string;
  name?: string;
  deviceInfo?: any;
}

export async function registerDevice(userId: string, deviceInfo: DeviceInfo) {
  // Check if device already exists
  const existingDevice = await db.device.findUnique({
    where: { hwid: deviceInfo.hwid },
  });

  if (existingDevice) {
    // Update existing device
    return await db.device.update({
      where: { id: existingDevice.id },
      data: {
        name: deviceInfo.name || existingDevice.name,
        ip: deviceInfo.ip || existingDevice.ip,
        mac: deviceInfo.mac || existingDevice.mac,
        deviceInfo: deviceInfo.deviceInfo || existingDevice.deviceInfo,
        lastSeen: new Date(),
        isActive: true,
      },
    });
  }

  // Create new device
  return await db.device.create({
    data: {
      id: uuidv4(),
      userId,
      hwid: deviceInfo.hwid,
      name: deviceInfo.name || `Device ${Date.now()}`,
      ip: deviceInfo.ip,
      mac: deviceInfo.mac,
      deviceInfo: deviceInfo.deviceInfo || {},
    },
  });
}

export async function getUserDevices(userId: string) {
  return await db.device.findMany({
    where: { userId },
    orderBy: { lastSeen: 'desc' },
  });
}

export async function getDeviceByHwid(hwid: string) {
  return await db.device.findUnique({
    where: { hwid },
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

export async function updateDeviceLastSeen(hwid: string, ip?: string) {
  return await db.device.updateMany({
    where: { hwid },
    data: {
      lastSeen: new Date(),
      ip: ip,
    },
  });
}

export async function deactivateDevice(deviceId: string) {
  return await db.device.update({
    where: { id: deviceId },
    data: { isActive: false },
  });
}

export async function activateDevice(deviceId: string) {
  return await db.device.update({
    where: { id: deviceId },
    data: { isActive: true },
  });
}

export async function deleteDevice(deviceId: string) {
  return await db.device.delete({
    where: { id: deviceId },
  });
}

export async function isDeviceOwnedByUser(deviceId: string, userId: string): Promise<boolean> {
  const device = await db.device.findUnique({
    where: { id: deviceId, userId },
  });
  return !!device;
}