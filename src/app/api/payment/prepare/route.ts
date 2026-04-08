import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/paypal";
import { z } from "zod";

const schema = z.object({
  templateId: z.string(),
  couponCode: z.string().optional(),
});

// 템플릿 가격 (USD)
function krwToUsd(krw: number): string {
  return (krw / 1400).toFixed(2); // 고정 환율, 추후 API 연동 가능
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { templateId, couponCode } = body.data;

  const template = await prisma.template.findUnique({
    where: { id: templateId, isActive: true },
    select: { id: true, title: true, price: true, isPremium: true },
  });
  if (!template?.isPremium || !template.price) {
    return NextResponse.json({ error: "유료 템플릿이 아닙니다" }, { status: 400 });
  }

  const existing = await prisma.purchase.findFirst({
    where: { userId: session.user.id, templateId, status: "COMPLETED" },
  });
  if (existing) return NextResponse.json({ error: "이미 구매한 템플릿입니다" }, { status: 400 });

  let finalPrice = template.price;
  let couponId: string | undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase(), isActive: true } });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      const used = await prisma.couponUse.findUnique({
        where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
      });
      if (!used && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        finalPrice = coupon.type === "PERCENT"
          ? Math.floor(finalPrice * (1 - coupon.value / 100))
          : Math.max(0, finalPrice - coupon.value);
        couponId = coupon.id;
      }
    }
  }

  const amountUsd = krwToUsd(finalPrice);
  const customId = `${session.user.id}|${templateId}|${couponId ?? ""}`;

  const order = await createOrder(amountUsd, `TemplateHouse: ${template.title}`, customId);

  return NextResponse.json({ orderId: order.id, amountUsd, couponId });
}
