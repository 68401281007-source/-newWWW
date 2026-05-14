import { Request, Response } from "express";
import { prisma } from "../db.js";

export async function dashboard(req: Request, res: Response) {
  const [files, users, messages, notifications, activities] = await Promise.all([
    prisma.fileAsset.count(),
    prisma.user.count(),
    prisma.message.count(),
    prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } })
  ]);

  res.json({
    stats: { files, users, messages, storageGb: 2.4 },
    notifications,
    activities
  });
}

export async function departments(_req: Request, res: Response) {
  const items = await prisma.department.findMany({
    include: { _count: { select: { users: true, files: true, messages: true } } },
    orderBy: { name: "asc" }
  });
  res.json({ departments: items });
}

export async function users(_req: Request, res: Response) {
  const items = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, online: true, department: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ users: items });
}

export async function notifications(req: Request, res: Response) {
  const items = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "desc" } });
  res.json({ notifications: items });
}

export async function activity(_req: Request, res: Response) {
  const logs = await prisma.activityLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  res.json({ logs });
}

export async function saveDraft(req: Request, res: Response) {
  const scope = String(req.params.scope);
  const draft = await prisma.autoSaveDraft.upsert({
    where: { scope_userId: { scope, userId: req.user!.id } },
    update: { payload: req.body },
    create: { scope, userId: req.user!.id, payload: req.body }
  });
  res.json({ draft });
}

export async function getDraft(req: Request, res: Response) {
  const scope = String(req.params.scope);
  const draft = await prisma.autoSaveDraft.findUnique({
    where: { scope_userId: { scope, userId: req.user!.id } }
  });
  res.json({ draft });
}
