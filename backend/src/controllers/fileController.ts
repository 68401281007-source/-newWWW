import { Request, Response } from "express";
import { prisma } from "../db.js";
import { storeFile } from "../services/storage.js";
import { logActivity } from "../services/activity.js";

export async function listFiles(req: Request, res: Response) {
  const q = String(req.query.q ?? "");
  const files = await prisma.fileAsset.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { category: { contains: q } }
      ],
      ...(req.user!.role === "ADMIN" ? {} : { departmentId: req.user!.departmentId ?? undefined })
    },
    include: { owner: { select: { name: true, email: true } }, department: true },
    orderBy: { updatedAt: "desc" },
    take: 100
  });
  res.json({ files });
}

export async function uploadFiles(req: Request, res: Response) {
  const uploads = req.files as Express.Multer.File[];
  const created = [];

  for (const file of uploads) {
    const stored = await storeFile(file);
    const asset = await prisma.fileAsset.create({
      data: {
        name: req.body.name || file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category: req.body.category || "General",
        url: stored.url,
        provider: stored.provider,
        ownerId: req.user!.id,
        departmentId: req.body.departmentId ? String(req.body.departmentId) : req.user!.departmentId,
        visibility: req.body.visibility || "DEPARTMENT"
      }
    });
    created.push(asset);
    await logActivity("UPLOAD_FILE", "FileAsset", req.user!.id, { fileId: asset.id, name: asset.name });
  }

  res.status(201).json({ files: created });
}

export async function shareFile(req: Request, res: Response) {
  const file = await prisma.fileAsset.update({
    where: { id: String(req.params.id) },
    data: { visibility: "SHARED" }
  });
  await logActivity("SHARE_FILE", "FileAsset", req.user!.id, { fileId: file.id });
  res.json({ file, shareUrl: file.url });
}
