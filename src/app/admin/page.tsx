import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenue, todayRevenue, monthRevenue, totalUsers, activeSubscriptions, totalTemplates, recentPurchases] =
    await Promise.all([
      prisma.purchase.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.purchase.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
      prisma.purchase.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.template.count(),
      prisma.purchase.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          template: { select: { title: true } },
        },
      }),
    ]);

  const stats = [
    { label: "오늘 매출", value: `${(todayRevenue._sum.amount ?? 0).toLocaleString()}원` },
    { label: "이달 매출", value: `${(monthRevenue._sum.amount ?? 0).toLocaleString()}원` },
    { label: "총 매출", value: `${(totalRevenue._sum.amount ?? 0).toLocaleString()}원` },
    { label: "총 회원", value: `${totalUsers}명` },
    { label: "구독자", value: `${activeSubscriptions}명` },
    { label: "템플릿 수", value: `${totalTemplates}개` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">어드민 대시보드</h1>
        <div className="flex gap-2">
          <Link href="/admin/templates" className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">템플릿 관리</Link>
          <Link href="/admin/users" className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">사용자 관리</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 결제</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["구매자", "템플릿", "금액", "결제일"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-900">{p.user.name ?? p.user.email}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{p.template.title}</td>
                  <td className="px-4 py-3 font-medium">{p.amount.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-gray-400">{p.createdAt.toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
              {recentPurchases.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">아직 결제 내역이 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
