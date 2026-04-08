"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Template = { id: string; title: string; category: string; format: string; isPremium: boolean; price: number | null; downloads: number; isActive: boolean; createdAt: string };

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", category: "notion", format: "Notion", tags: "", isPremium: false, price: "" });

  useEffect(() => {
    fetch("/api/admin/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("파일을 선택하세요");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("meta", JSON.stringify({
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()),
      isPremium: form.isPremium,
      price: form.isPremium ? parseInt(form.price) : null,
    }));

    const res = await fetch("/api/admin/templates", { method: "POST", body: fd });
    if (res.ok) {
      const t = await res.json();
      setTemplates((prev) => [t, ...prev]);
      alert("업로드 완료!");
      router.refresh();
    } else {
      alert("업로드 실패");
    }
    setUploading(false);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/templates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, isActive: !isActive } : t));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">템플릿 관리</h1>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">새 템플릿 업로드</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
          {[
            { label: "제목", key: "title", type: "text" },
            { label: "슬러그 (URL)", key: "slug", type: "text" },
            { label: "카테고리", key: "category", type: "text" },
            { label: "형식", key: "format", type: "text" },
            { label: "태그 (쉼표 구분)", key: "tags", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-sm text-gray-600">{label}</label>
              <input type={type} value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-sm text-gray-600">설명</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPremium" checked={form.isPremium} onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} />
            <label htmlFor="isPremium" className="text-sm text-gray-600">프리미엄 템플릿</label>
          </div>
          {form.isPremium && (
            <div>
              <label className="text-sm text-gray-600">가격 (원)</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          )}
          <div className="col-span-2">
            <label className="text-sm text-gray-600">파일</label>
            <input type="file" ref={fileRef} accept=".docx,.xlsx,.pptx,.pdf,.txt" className="w-full mt-1 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={uploading} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {uploading ? "업로드 중..." : "업로드"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{["ID", "제목", "카테고리", "유형", "가격", "다운로드", "상태", ""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-400 text-xs">{t.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[160px]">{t.title}</td>
                <td className="px-4 py-3 text-gray-500">{t.category}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.isPremium ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{t.isPremium ? "프리미엄" : "무료"}</span></td>
                <td className="px-4 py-3 text-gray-600">{t.price ? `${t.price.toLocaleString()}원` : "-"}</td>
                <td className="px-4 py-3 text-gray-600">{t.downloads.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{t.isActive ? "활성" : "비활성"}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(t.id, t.isActive)} className="text-xs text-gray-500 hover:text-gray-900 underline">{t.isActive ? "비활성화" : "활성화"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
