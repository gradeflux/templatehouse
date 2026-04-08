import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub || sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "활성 구독이 없습니다" }, { status: 400 });
  }

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { status: "CANCELED", canceledAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "구독이 해지되었습니다. 현재 기간 종료까지 이용 가능합니다." });
}
