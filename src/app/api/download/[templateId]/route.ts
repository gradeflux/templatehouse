import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canDownload } from "@/lib/rbac";
import { getSignedDownloadUrl } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const session = await auth();

  const result = await canDownload(session?.user?.id, templateId);

  if (!result.allowed) {
    if (result.reason === "NOT_LOGGED_IN") {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    return NextResponse.json({ error: "구매 또는 구독이 필요합니다" }, { status: 403 });
  }

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { fileKey: true, title: true },
  });

  if (!template) {
    return NextResponse.json({ error: "템플릿을 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.template.update({
    where: { id: templateId },
    data: { downloads: { increment: 1 } },
  });

  const signedUrl = await getSignedDownloadUrl(template.fileKey);
  return NextResponse.json({ url: signedUrl, filename: `${template.title}.docx` });
}
