import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendSubscriptionReceiptEmail, sendTelegramSubscriptionAlert } from "@/lib/notify";
import { z } from "zod";

const PLANS = {
  MONTHLY: { amount: 9900, label: "월간 구독" },
  YEARLY:  { amount: 79000, label: "연간 구독" },
} as const;

const schema = z.object({
  billingKey: z.string(),
  customerKey: z.string(),
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

async function chargeWithBillingKey(billingKey: string, amount: number, orderId: string, orderName: string, customerEmail: string) {
  const res = await fetch("https://api.portone.io/payments/billing-key", {
    method: "POST",
    headers: {
      Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeId: process.env.PORTONE_STORE_ID,
      billingKey,
      orderId,
      orderName,
      amount: { total: amount },
      currency: "KRW",
      customer: { email: customerEmail },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.status !== "PAID") throw new Error(data.message ?? "빌링키 결제 실패");
  return data;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { billingKey, customerKey, plan } = body.data;
  const planInfo = PLANS[plan];

  // 기존 구독 확인
  const existingSub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (existingSub?.status === "ACTIVE") {
    return NextResponse.json({ error: "이미 활성 구독이 있습니다" }, { status: 400 });
  }

  const orderId = `sub_${Date.now()}_${session.user.id.slice(-6)}`;
  const txData = await chargeWithBillingKey(billingKey, planInfo.amount, orderId, planInfo.label, session.user.email!);

  const nextBillingAt = new Date();
  if (plan === "MONTHLY") nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
  else nextBillingAt.setFullYear(nextBillingAt.getFullYear() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, plan, status: "ACTIVE", billingKey, customerKey, nextBillingAt },
    update: { plan, status: "ACTIVE", billingKey, customerKey, nextBillingAt, canceledAt: null },
  });

  await prisma.subscriptionPayment.create({
    data: { subscriptionId: subscription.id, amount: planInfo.amount, pgTxId: txData.paymentId, status: "COMPLETED" },
  });

  Promise.all([
    sendSubscriptionReceiptEmail({
      to: session.user.email!, userName: session.user.name ?? "고객",
      plan, amount: planInfo.amount, nextBillingAt,
    }),
    sendTelegramSubscriptionAlert({ userName: session.user.name ?? "익명", plan, amount: planInfo.amount, isNew: !existingSub }),
  ]).catch(console.error);

  return NextResponse.json({ success: true, subscriptionId: subscription.id });
}
