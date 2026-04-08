import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [purchases, subscription] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      include: { template: { select: { id: true, title: true, category: true, format: true, previewImageUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, plan: true, nextBillingAt: true },
    }),
  ]);

  const planLabel = subscription?.plan === "YEARLY" ? "연간 구독" : "월간 구독";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
        <p className="text-gray-500 mt-1">{session.user.name} · {session.user.email}</p>
      </div>

      {subscription?.status === "ACTIVE" && (
        <div className="bg-black text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{planLabel} 구독 중</p>
            <p className="text-lg font-semibold mt-1">모든 프리미엄 템플릿 무제한 이용 가능</p>
            <p className="text-sm text-gray-400 mt-1">다음 결제일: {subscription.nextBillingAt.toLocaleDateString("ko-KR")}</p>
          </div>
          <Link href="/dashboard/subscription" className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            구독 관리
          </Link>
        </div>
      )}

      {!subscription && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">프리미엄 구독으로 업그레이드</p>
            <p className="text-sm text-gray-500 mt-1">월 9,900원으로 모든 템플릿 무제한 이용</p>
          </div>
          <Link href="/pricing" className="text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            구독 시작
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">구매한 템플릿 ({purchases.length}개)</h2>
        {purchases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>아직 구매한 템플릿이 없습니다</p>
            <Link href="/" className="mt-4 inline-block text-sm text-black underline">템플릿 둘러보기</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <Image src={p.template.previewImageUrl || "/placeholder.png"} alt={p.template.title} width={64} height={64} className="rounded-lg object-cover w-16 h-16" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.template.title}</p>
                  <p className="text-sm text-gray-500">{p.template.category} · {p.template.format}</p>
                  <p className="text-xs text-gray-400 mt-1">{p.createdAt.toLocaleDateString("ko-KR")} 구매 · {p.amount.toLocaleString()}원</p>
                </div>
                <DownloadBtn templateId={p.template.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadBtn({ templateId }: { templateId: string }) {
  return (
    <a
      href={`/api/download/${templateId}`}
      onClick={async (e) => {
        e.preventDefault();
        const res = await fetch(`/api/download/${templateId}`);
        const { url, filename } = await res.json();
        const a = document.createElement("a");
        a.href = url; a.download = filename; a.click();
      }}
      className="text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
    >
      다운로드
    </a>
  );
}
