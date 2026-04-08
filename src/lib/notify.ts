import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── 이메일 ───────────────────────────────────────────────────
export async function sendReceiptEmail({
  to, userName, templateTitle, amount, txId, purchasedAt,
}: {
  to: string; userName: string; templateTitle: string;
  amount: number; txId: string; purchasedAt: Date;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "no-reply@templatehouse.kr",
    to,
    subject: `[TemplateHouse] 구매 확인: ${templateTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2>구매해 주셔서 감사합니다 🎉</h2>
        <p>안녕하세요, <b>${userName}</b>님</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">상품명</td><td style="padding:8px;border-bottom:1px solid #eee">${templateTitle}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">결제금액</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${amount.toLocaleString()}원</b></td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">거래번호</td><td style="padding:8px;border-bottom:1px solid #eee;font-size:12px;color:#999">${txId}</td></tr>
          <tr><td style="padding:8px;color:#666">결제일시</td><td style="padding:8px">${purchasedAt.toLocaleString("ko-KR")}</td></tr>
        </table>
        <p>마이페이지에서 언제든지 다시 다운로드할 수 있습니다.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">마이페이지 바로가기</a>
      </div>
    `,
  });
}

export async function sendSubscriptionReceiptEmail({
  to, userName, plan, amount, nextBillingAt,
}: {
  to: string; userName: string; plan: string; amount: number; nextBillingAt: Date;
}) {
  const planLabel = plan === "MONTHLY" ? "월간 구독" : "연간 구독";
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "no-reply@templatehouse.kr",
    to,
    subject: `[TemplateHouse] ${planLabel} 결제 완료`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2>${planLabel} 결제 완료 ✅</h2>
        <p>안녕하세요, <b>${userName}</b>님</p>
        <p>모든 프리미엄 템플릿을 무제한 다운로드하실 수 있습니다.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">플랜</td><td style="padding:8px;border-bottom:1px solid #eee">${planLabel}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">결제금액</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${amount.toLocaleString()}원</b></td></tr>
          <tr><td style="padding:8px;color:#666">다음 결제일</td><td style="padding:8px">${nextBillingAt.toLocaleDateString("ko-KR")}</td></tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">구독 관리</a>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail({
  to, userName, failReason,
}: {
  to: string; userName: string; failReason: string;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "no-reply@templatehouse.kr",
    to,
    subject: "[TemplateHouse] 구독 자동결제 실패 안내",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <h2>⚠️ 구독 자동결제가 실패했습니다</h2>
        <p>안녕하세요, <b>${userName}</b>님</p>
        <p>자동결제 처리 중 문제가 발생했습니다: <b>${failReason}</b></p>
        <p>구독 혜택이 중단되기 전에 결제 수단을 확인해 주세요.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription" style="display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;text-decoration:none;border-radius:6px">결제 수단 업데이트</a>
      </div>
    `,
  });
}

// ── 텔레그램 판매 알림 ─────────────────────────────────────────
export async function sendTelegramSaleAlert({
  userName, templateTitle, amount,
}: {
  userName: string; templateTitle: string; amount: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  const msg = `💰 *판매 알림*\n👤 ${userName}\n📄 ${templateTitle}\n💵 ${amount.toLocaleString()}원`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
  });
}

export async function sendTelegramSubscriptionAlert({
  userName, plan, amount, isNew,
}: {
  userName: string; plan: string; amount: number; isNew: boolean;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  const planLabel = plan === "MONTHLY" ? "월간" : "연간";
  const emoji = isNew ? "🎉" : "🔄";
  const msg = `${emoji} *구독 ${isNew ? "신규" : "갱신"}*\n👤 ${userName}\n📅 ${planLabel} 구독\n💵 ${amount.toLocaleString()}원`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
  });
}
