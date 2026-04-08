import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const BUCKET = process.env.SUPABASE_BUCKET ?? "templatehouse-files";
const SIGNED_URL_EXPIRES = 300; // 5분

export async function getSignedDownloadUrl(fileKey: string): Promise<string> {
  const { data, error } = await getSupabase().storage
    .from(BUCKET)
    .createSignedUrl(fileKey, SIGNED_URL_EXPIRES);

  if (error || !data?.signedUrl) {
    throw new Error(`Signed URL 생성 실패: ${error?.message}`);
  }
  return data.signedUrl;
}

export async function uploadTemplateFile(
  fileKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(fileKey, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`업로드 실패: ${error.message}`);
}

export async function deleteTemplateFile(fileKey: string): Promise<void> {
  const { error } = await getSupabase().storage.from(BUCKET).remove([fileKey]);
  if (error) throw new Error(`삭제 실패: ${error.message}`);
}
