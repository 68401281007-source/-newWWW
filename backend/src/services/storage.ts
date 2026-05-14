import { v2 as cloudinary } from "cloudinary";
import { env } from "../env.js";

const cloudReady = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (cloudReady) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function storeFile(file: Express.Multer.File) {
  if (!cloudReady) {
    return { url: `/uploads/${file.filename}`, provider: "local" };
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: "enterprise-collab",
    resource_type: "auto",
    use_filename: true
  });

  return { url: result.secure_url, provider: "cloudinary" };
}
