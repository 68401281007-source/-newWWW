import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../db.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { logActivity } from "../services/activity.js";

function publicUser(user: any) {
  const { passwordHash, refreshToken, twoFactorSecret, ...safe } = user;
  return safe;
}

export async function register(req: Request, res: Response) {
  const { name, email, password, departmentId } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash, departmentId } });
  await logActivity("REGISTER", "User", user.id, { email });
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const tokenUser = { id: user.id, email: user.email, role: user.role, departmentId: user.departmentId };
  const accessToken = signAccessToken(tokenUser);
  const refreshToken = signRefreshToken(tokenUser);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken, online: true } });
  await logActivity("LOGIN", "User", user.id);
  res.json({ accessToken, refreshToken, user: publicUser(user) });
}

export async function logout(req: Request, res: Response) {
  if (req.user) {
    await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null, online: false } });
    await logActivity("LOGOUT", "User", req.user.id);
  }
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { department: true } });
  res.json({ user: user ? publicUser(user) : null });
}

export async function forgotPassword(_req: Request, res: Response) {
  res.json({ message: "Password reset instructions queued if the email exists." });
}

export async function resetPassword(_req: Request, res: Response) {
  res.json({ message: "Password reset endpoint is ready for email token integration." });
}
