import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenue, todayRevenue, monthRevenue, totalUsers, activeSubscriptions, totalPurchases] =
    await Promise.all([
      prisma.purchase.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.purchase.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
      prisma.purchase.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.purchase.count({ where: { status: "COMPLETED" } }),
    ]);

  return NextResponse.json({
    revenue: {
      total: totalRevenue._sum.amount ?? 0,
      today: todayRevenue._sum.amount ?? 0,
      month: monthRevenue._sum.amount ?? 0,
    },
    users: { total: totalUsers, subscribers: activeSubscriptions },
    purchases: { total: totalPurchases },
  });
}
