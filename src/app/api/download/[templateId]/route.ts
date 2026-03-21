import { type NextRequest } from "next/server";

// In-memory download counter (resets on server restart)
// For production, use a database or KV store like Vercel KV
const downloadCounts = new Map<string, number>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

  if (!templateId) {
    return Response.json({ error: "Template ID required" }, { status: 400 });
  }

  const current = downloadCounts.get(templateId) ?? 0;
  downloadCounts.set(templateId, current + 1);

  return Response.json({
    templateId,
    additionalDownloads: current + 1,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

  const count = downloadCounts.get(templateId) ?? 0;

  return Response.json({
    templateId,
    additionalDownloads: count,
  });
}
