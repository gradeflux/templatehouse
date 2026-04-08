import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = "templateallflix-files";
const SIGNED_URL_EXPIRES = 300; // 5분

function getS3() {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ROOT_USER ?? "templateallflix",
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? "minio_secret_2026",
    },
    forcePathStyle: true,
  });
}

export async function getSignedDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: fileKey });
  return getSignedUrl(getS3(), command, { expiresIn: SIGNED_URL_EXPIRES });
}

export async function uploadTemplateFile(fileKey: string, buffer: Buffer, mimeType: string): Promise<void> {
  await getS3().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType,
  }));
}

export async function deleteTemplateFile(fileKey: string): Promise<void> {
  await getS3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey }));
}
