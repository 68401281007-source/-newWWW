import { Request, Response } from "express";
import { prisma } from "../db.js";

export async function listMessages(req: Request, res: Response) {
  const room = String(req.query.room ?? "general");
  const messages = await prisma.message.findMany({
    where: { room },
    include: { sender: { select: { id: true, name: true, email: true, online: true } }, department: true },
    orderBy: { createdAt: "asc" },
    take: 200
  });
  res.json({ messages });
}

export async function createMessage(req: Request, res: Response) {
  const message = await prisma.message.create({
    data: {
      content: req.body.content,
      room: req.body.room ?? "general",
      attachmentUrl: req.body.attachmentUrl,
      senderId: req.user!.id,
      departmentId: req.body.departmentId ?? req.user!.departmentId
    },
    include: { sender: { select: { id: true, name: true, email: true, online: true } } }
  });
  res.status(201).json({ message });
}
