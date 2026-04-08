import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  templateId: z.string(),
  couponCode: z.string().optional(),
});

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
  if (!template || !template.isPremium || !template.price) {
    return NextResponse.json({ error: "유료 템플릿이 아닙니다" }, { status: 400 });
  }

  // 이미 구매했는지 확인
  const existing = await prisma.purchase.findFirst({
    where: { userId: session.user.id, templateId, status: "COMPLETED" },
  });
  if (existing) {
    return NextResponse.json({ error: "이미 구매한 템플릿입니다" }, { status: 400 });
  }

  let finalAmount = template.price;
  let couponId: string | undefined;

  // 쿠폰 적용
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode, isActive: true },
    });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      const alreadyUsed = await prisma.couponUse.findUnique({
        where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
      });
      if (!alreadyUsed && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        if (coupon.type === "PERCENT") {
          finalAmount = Math.floor(finalAmount * (1 - coupon.value / 100));
        } else {
          finalAmount = Math.max(0, finalAmount - coupon.value);
        }
        couponId = coupon.id;
      }
    }
  }

  // 주문 ID 생성
  const orderId = `th_${Date.now()}_${session.user.id.slice(-6)}`;

  return NextResponse.json({
    orderId,
    templateTitle: template.title,
    amount: finalAmount,
    originalAmount: template.price,
    couponId,
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  });
}
