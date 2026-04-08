import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { code, templatePrice } = await req.json();
  if (!code) return NextResponse.json({ error: "쿠폰 코드를 입력하세요" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase(), isActive: true } });

  if (!coupon) return NextResponse.json({ error: "유효하지 않은 쿠폰입니다" }, { status: 400 });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "만료된 쿠폰입니다" }, { status: 400 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "사용 한도가 초과된 쿠폰입니다" }, { status: 400 });
  }

  const alreadyUsed = await prisma.couponUse.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
  });
  if (alreadyUsed) return NextResponse.json({ error: "이미 사용한 쿠폰입니다" }, { status: 400 });

  const discount = coupon.type === "PERCENT"
    ? Math.floor(templatePrice * (coupon.value / 100))
    : Math.min(coupon.value, templatePrice);

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    type: coupon.type,
    value: coupon.value,
    discount,
    finalAmount: templatePrice - discount,
  });
}
