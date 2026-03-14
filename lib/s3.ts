// lib/s3.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME!;

/**
 * Generate a pre-signed URL for uploading a file directly from the browser.
 * Expires in 5 minutes — enough time for the user to complete the upload.
 */
export async function getUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

/**
 * Generate a pre-signed URL for downloading/viewing a file.
 * Expires in 15 minutes — covers the 10-min expiry window plus buffer.
 */
export async function getDownloadUrl(
  key: string,
  originalFileName: string,
  inline = false
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: inline
      ? "inline"
      : `attachment; filename="${encodeURIComponent(originalFileName)}"`,
  });
  return getSignedUrl(s3, command, { expiresIn: 900 });
}

/**
 * Delete a file from S3 (called by the cleanup cron job).
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
