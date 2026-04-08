import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { captureOrder } from "@/lib/paypal";
import { sendReceiptEmail, sendTelegramSaleAlert } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  templateId: z.string(),
  couponId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { orderId, templateId, couponId } = body.data;

  let captureData;
  try {
    captureData = await captureOrder(orderId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const capture = captureData.purchase_units[0].payments.captures[0];
  const amountUsd = parseFloat(capture.amount.value);

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: "템플릿 없음" }, { status: 404 });

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      templateId,
      amount: Math.round(amountUsd * 1400), // USD → KRW 기록용
      pgTxId: capture.id,
      couponId,
      status: "COMPLETED",
    },
  });

  if (couponId) {
    await prisma.$transaction([
      prisma.couponUse.create({ data: { couponId, userId: session.user.id } }),
      prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
    ]);
  }

  Promise.all([
    sendReceiptEmail({
      to: session.user.email!, userName: session.user.name ?? "Customer",
      templateTitle: template.title, amount: Math.round(amountUsd * 1400),
      txId: capture.id, purchasedAt: purchase.createdAt,
    }),
    sendTelegramSaleAlert({ userName: session.user.name ?? "익명", templateTitle: template.title, amount: Math.round(amountUsd * 1400) }),
  ]).catch(console.error);

  return NextResponse.json({ success: true, purchaseId: purchase.id });
}
