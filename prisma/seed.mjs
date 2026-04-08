import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const templates = require("../src/data/templates.json");

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

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
        fileKey: `templates/${t.id}.txt`,
        previewImageUrl: t.previewImage,
        downloads: t.downloads,
        tags: t.tags,
        isPremium: false,
        price: null,
      },
    });
  }

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
