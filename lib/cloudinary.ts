import { createHash } from "crypto";

const CLOUDINARY_FOLDER = "faces/photos";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export async function uploadImageDataUrl(imageDataUrl: string): Promise<string> {
  const cloudName = getRequiredEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = getRequiredEnv("CLOUDINARY_API_KEY");
  const apiSecret = getRequiredEnv("CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const formData = new FormData();
  formData.set("file", imageDataUrl);
  formData.set("api_key", apiKey);
  formData.set("folder", CLOUDINARY_FOLDER);
  formData.set("signature", signature);
  formData.set("timestamp", String(timestamp));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    body: formData,
    method: "POST"
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string }; secure_url?: string }
    | null;

  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? "Cloudinary upload failed.");
  }

  return payload.secure_url;
}
