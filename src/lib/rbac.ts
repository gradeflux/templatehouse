import { prisma } from "@/lib/db";

export type AccessResult =
  | { allowed: true }
  | { allowed: false; reason: "NOT_LOGGED_IN" | "NOT_PURCHASED" | "TEMPLATE_FREE" };

export async function canDownload(userId: string | undefined, templateId: string): Promise<AccessResult> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { isPremium: true, price: true },
  });

  if (!template) return { allowed: false, reason: "NOT_PURCHASED" };
  if (!template.isPremium) return { allowed: true }; // 무료 템플릿

  if (!userId) return { allowed: false, reason: "NOT_LOGGED_IN" };

  // 구독자 확인
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });
  if (sub?.status === "ACTIVE") return { allowed: true };

  // 건별 구매 확인
  const purchase = await prisma.purchase.findFirst({
    where: { userId, templateId, status: "COMPLETED" },
  });
  if (purchase) return { allowed: true };

  return { allowed: false, reason: "NOT_PURCHASED" };
}

export async function getUserAccess(userId: string) {
  const [sub, purchases] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId }, select: { status: true, plan: true, nextBillingAt: true } }),
    prisma.purchase.findMany({ where: { userId, status: "COMPLETED" }, select: { templateId: true } }),
  ]);

  return {
    isSubscriber: sub?.status === "ACTIVE",
    subscription: sub,
    purchasedIds: purchases.map((p) => p.templateId),
  };
}
