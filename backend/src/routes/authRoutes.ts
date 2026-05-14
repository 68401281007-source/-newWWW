import { Router } from "express";
import { z } from "zod";
import { forgotPassword, login, logout, me, register, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), departmentId: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/register", (req, res, next) => {
  req.body = registerSchema.parse(req.body);
  register(req, res).catch(next);
});
router.post("/login", (req, res, next) => {
  req.body = loginSchema.parse(req.body);
  login(req, res).catch(next);
});
router.post("/logout", requireAuth, (req, res, next) => logout(req, res).catch(next));
router.get("/me", requireAuth, (req, res, next) => me(req, res).catch(next));
router.post("/forgot-password", (req, res, next) => forgotPassword(req, res).catch(next));
router.post("/reset-password", (req, res, next) => resetPassword(req, res).catch(next));

export default router;
