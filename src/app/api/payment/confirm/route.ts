import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendReceiptEmail, sendTelegramSaleAlert } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  paymentId: z.string(),  // PortOne 거래 ID
  templateId: z.string(),
  amount: z.number(),
  couponId: z.string().optional(),
});

async function verifyPortOnePayment(paymentId: string, expectedAmount: number) {
  const res = await fetch(`https://api.portone.io/payments/${paymentId}`, {
    headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
  });
  if (!res.ok) throw new Error("PortOne 조회 실패");
  const data = await res.json();

  if (data.status !== "PAID") throw new Error(`결제 상태 오류: ${data.status}`);
  if (data.amount.total !== expectedAmount) throw new Error("결제 금액 불일치");
  return data;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { paymentId, templateId, amount, couponId } = body.data;

  try {
    await verifyPortOnePayment(paymentId, amount);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: "템플릿 없음" }, { status: 404 });

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      templateId,
      amount,
      pgTxId: paymentId,
      couponId,
      status: "COMPLETED",
    },
  });

  // 쿠폰 사용 기록
  if (couponId) {
    await prisma.$transaction([
      prisma.couponUse.create({ data: { couponId, userId: session.user.id } }),
      prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
    ]);
  }

  // 이메일 + 텔레그램 알림 (비동기)
  const user = session.user;
  Promise.all([
    sendReceiptEmail({
      to: user.email!, userName: user.name ?? "고객", templateTitle: template.title,
      amount, txId: paymentId, purchasedAt: purchase.createdAt,
    }),
    sendTelegramSaleAlert({ userName: user.name ?? "익명", templateTitle: template.title, amount }),
  ]).catch(console.error);

  return NextResponse.json({ success: true, purchaseId: purchase.id });
}
