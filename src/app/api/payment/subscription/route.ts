import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createSubscriptionOrder } from "@/lib/paypal";
import { z } from "zod";

// PayPal 대시보드에서 생성한 구독 플랜 ID
const PLAN_IDS: Record<string, string> = {
  MONTHLY: process.env.PAYPAL_PLAN_MONTHLY ?? "",
  YEARLY:  process.env.PAYPAL_PLAN_YEARLY ?? "",
};

const schema = z.object({ plan: z.enum(["MONTHLY", "YEARLY"]) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const { plan } = body.data;
  const planId = PLAN_IDS[plan];
  if (!planId) return NextResponse.json({ error: "플랜 ID 미설정" }, { status: 500 });

  const existing = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "이미 활성 구독이 있습니다" }, { status: 400 });
  }

  const sub = await createSubscriptionOrder(planId, `${session.user.id}|${plan}`);
  const approveLink = sub.links.find((l) => l.rel === "approve")?.href;

  return NextResponse.json({ subscriptionId: sub.id, approveUrl: approveLink });
}

// PayPal 구독 승인 후 콜백 처리
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get("subscription_id");
  const session = await auth();

  if (!subscriptionId || !session?.user?.id) {
    return NextResponse.redirect(new URL("/pricing?error=1", req.url));
  }

  const nextBillingAt = new Date();
  nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan: "MONTHLY",
      status: "ACTIVE",
      billingKey: subscriptionId,
      customerKey: session.user.id,
      nextBillingAt,
    },
    update: { status: "ACTIVE", billingKey: subscriptionId, nextBillingAt, canceledAt: null },
  });

  return NextResponse.redirect(new URL("/dashboard?sub=success", req.url));
}
