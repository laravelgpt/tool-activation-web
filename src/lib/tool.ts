import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface ToolCreateInput {
  name: string;
  description?: string;
  category?: string;
  version?: string;
  downloadUrl?: string;
  price?: number;
  features?: any;
  requirements?: any;
}

export async function createTool(input: ToolCreateInput) {
  return await db.tool.create({
    data: {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      category: input.category,
      version: input.version,
      downloadUrl: input.downloadUrl,
      price: input.price || 0,
      features: input.features || {},
      requirements: input.requirements || {},
    },
  });
}

export async function getTools(category?: string, activeOnly = true) {
  const where: any = {};
  if (activeOnly) {
    where.isActive = true;
  }
  if (category) {
    where.category = category;
  }

  return await db.tool.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getToolById(id: string) {
  return await db.tool.findUnique({
    where: { id },
    include: {
      downloads: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateTool(id: string, input: Partial<ToolCreateInput>) {
  return await db.tool.update({
    where: { id },
    data: input,
  });
}

export async function deleteTool(id: string) {
  return await db.tool.delete({
    where: { id },
  });
}

export async function getToolCategories() {
  const tools = await db.tool.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });

  return tools.map(tool => tool.category).filter(Boolean);
}

export async function incrementDownloadCount(downloadId: string) {
  return await db.download.update({
    where: { id: downloadId },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
}