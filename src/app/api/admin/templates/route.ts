import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadTemplateFile } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, format: true, isPremium: true, price: true, downloads: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const meta = JSON.parse(form.get("meta") as string);

  if (!file) return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "docx";
  const fileKey = `templates/${meta.id ?? Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadTemplateFile(fileKey, buffer, file.type);

  const template = await prisma.template.create({
    data: {
      id: meta.id ?? `tpl-${Date.now()}`,
      title: meta.title,
      slug: meta.slug,
      description: meta.description,
      category: meta.category,
      format: meta.format,
      fileKey,
      previewImageUrl: meta.previewImageUrl ?? "",
      tags: meta.tags ?? [],
      isPremium: meta.isPremium ?? false,
      price: meta.isPremium ? meta.price : null,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id, ...data } = await req.json();
  const template = await prisma.template.update({ where: { id }, data });
  return NextResponse.json(template);
}
