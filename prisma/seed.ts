import { PrismaClient } from "@prisma/client";
import templates from "../src/data/templates.json";

const prisma = new PrismaClient();

async function main() {
  console.log("시딩 시작...");

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        category: t.category,
        format: t.format,
        fileKey: `templates/${t.id}.txt`, // Supabase 업로드 후 실제 키로 교체
        previewImageUrl: t.previewImage,
        downloads: t.downloads,
        tags: t.tags,
        isPremium: false,
        price: null,
      },
    });
  }

  // 샘플 쿠폰 생성
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      maxUses: 1000,
      expiresAt: new Date("2026-12-31"),
    },
  });

  console.log(`✅ ${templates.length}개 템플릿, 1개 쿠폰 시딩 완료`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
