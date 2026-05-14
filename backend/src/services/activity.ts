import { prisma } from "../db.js";

export async function logActivity(action: string, entity: string, userId?: string, metadata?: object) {
  return prisma.activityLog.create({
    data: { action, entity, userId, metadata: metadata ?? {} }
  });
}
