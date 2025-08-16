import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface DownloadCreateInput {
  toolId: string;
  version: string;
  fileName: string;
  fileSize?: number;
  downloadUrl: string;
}

export async function createDownload(input: DownloadCreateInput) {
  return await db.download.create({
    data: {
      id: uuidv4(),
      toolId: input.toolId,
      version: input.version,
      fileName: input.fileName,
      fileSize: input.fileSize,
      downloadUrl: input.downloadUrl,
    },
  });
}

export async function getDownloads(toolId?: string) {
  const where: any = {};
  if (toolId) {
    where.toolId = toolId;
  }

  return await db.download.findMany({
    where,
    include: {
      tool: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDownloadById(id: string) {
  return await db.download.findUnique({
    where: { id },
    include: {
      tool: {
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
        },
      },
    },
  });
}

export async function updateDownload(id: string, input: Partial<DownloadCreateInput>) {
  return await db.download.update({
    where: { id },
    data: input,
  });
}

export async function deleteDownload(id: string) {
  return await db.download.delete({
    where: { id },
  });
}

export async function toggleDownloadActive(id: string) {
  const download = await db.download.findUnique({
    where: { id },
  });

  if (!download) {
    throw new Error('Download not found');
  }

  return await db.download.update({
    where: { id },
    data: {
      isActive: !download.isActive,
    },
  });
}