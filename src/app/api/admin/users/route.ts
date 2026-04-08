import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, role: true, createdAt: true,
        subscription: { select: { status: true, plan: true, nextBillingAt: true } },
        _count: { select: { purchases: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { userId, action } = await req.json();

  if (action === "cancel_subscription") {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "CANCELED", canceledAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "make_admin") {
    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "알 수 없는 action" }, { status: 400 });
}
