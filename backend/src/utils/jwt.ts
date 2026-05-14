import jwt from "jsonwebtoken";
import { RoleName } from "@prisma/client";
import { env } from "../env.js";

export type TokenUser = { id: string; email: string; role: RoleName; departmentId?: string | null };

export function signAccessToken(user: TokenUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(user: TokenUser) {
  return jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: "14d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenUser;
}
