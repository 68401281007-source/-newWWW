import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: "../.env" });

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-now"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-refresh-change-me"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(4000),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

export const env = schema.parse(process.env);

export const clientOrigins = env.CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
