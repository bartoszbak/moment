import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const R2_FOLDER = "faces/photos";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getR2Client() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

function parseImageDataUrl(imageDataUrl: string) {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("imageDataUrl must be a valid base64 image data URL.");
  }

  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length) {
    throw new Error("imageDataUrl is empty.");
  }

  const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";

  return {
    buffer,
    contentType,
    extension
  };
}

function getPublicUrl(key: string) {
  const publicUrl = getRequiredEnv("R2_PUBLIC_URL").replace(/\/+$/, "");

  return `${publicUrl}/${key}`;
}

export async function uploadImageDataUrl(imageDataUrl: string): Promise<string> {
  const bucket = getRequiredEnv("R2_BUCKET_NAME");
  const client = getR2Client();
  const { buffer, contentType, extension } = parseImageDataUrl(imageDataUrl);
  const key = `${R2_FOLDER}/${Date.now()}-${randomUUID()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return getPublicUrl(key);
}
