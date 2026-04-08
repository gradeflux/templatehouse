"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Sub = { status: string; plan: string; nextBillingAt: string; canceledAt?: string };

export default function SubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetch("/api/payment/subscription/status")
      .then((r) => r.json())
      .then((d) => { setSub(d.subscription); setLoading(false); });
  }, []);

  const handleCancel = async () => {
    if (!confirm("구독을 해지하시겠습니까? 현재 기간 종료까지는 계속 이용 가능합니다.")) return;
    setCanceling(true);
    await fetch("/api/payment/subscription/cancel", { method: "POST" });
    alert("구독 해지 신청이 완료되었습니다.");
    router.push("/dashboard");
  };

  if (loading) return <div className="max-w-lg mx-auto px-4 py-12 text-center text-gray-400">불러오는 중...</div>;

  const planLabel = sub?.plan === "YEARLY" ? "연간 구독" : "월간 구독";
  const planAmount = sub?.plan === "YEARLY" ? "79,000원/년" : "9,900원/월";

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">구독 관리</h1>

      {!sub || sub.status === "CANCELED" ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">현재 구독 중인 플랜이 없습니다</p>
          <a href="/pricing" className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
            구독 시작하기
          </a>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{planLabel}</p>
              <p className="text-gray-500 text-sm mt-1">{planAmount}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {sub.status === "ACTIVE" ? "구독 중" : sub.status === "PAST_DUE" ? "결제 실패" : sub.status}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">다음 결제일</span>
              <span className="text-gray-900">{new Date(sub.nextBillingAt).toLocaleDateString("ko-KR")}</span>
            </div>
            {sub.canceledAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">해지 신청일</span>
                <span className="text-gray-900">{new Date(sub.canceledAt).toLocaleDateString("ko-KR")}</span>
              </div>
            )}
          </div>

          {sub.status === "ACTIVE" && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="mt-6 w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {canceling ? "처리 중..." : "구독 해지"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
