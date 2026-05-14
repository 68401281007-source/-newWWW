import multer from "multer";
import { Router } from "express";
import { RoleName } from "@prisma/client";
import { activity, dashboard, departments, getDraft, notifications, saveDraft, users } from "../controllers/coreController.js";
import { listFiles, shareFile, uploadFiles } from "../controllers/fileController.js";
import { createMessage, listMessages } from "../controllers/messageController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 250 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);
router.get("/dashboard", (req, res, next) => dashboard(req, res).catch(next));
router.get("/departments", (req, res, next) => departments(req, res).catch(next));
router.get("/users", requireRole(RoleName.ADMIN, RoleName.MANAGER), (req, res, next) => users(req, res).catch(next));
router.get("/notifications", (req, res, next) => notifications(req, res).catch(next));
router.get("/activity", requireRole(RoleName.ADMIN, RoleName.MANAGER), (req, res, next) => activity(req, res).catch(next));
router.get("/files", (req, res, next) => listFiles(req, res).catch(next));
router.post("/files", upload.array("files", 12), (req, res, next) => uploadFiles(req, res).catch(next));
router.post("/files/:id/share", (req, res, next) => shareFile(req, res).catch(next));
router.get("/messages", (req, res, next) => listMessages(req, res).catch(next));
router.post("/messages", (req, res, next) => createMessage(req, res).catch(next));
router.get("/autosave/:scope", (req, res, next) => getDraft(req, res).catch(next));
router.put("/autosave/:scope", (req, res, next) => saveDraft(req, res).catch(next));

export default router;
