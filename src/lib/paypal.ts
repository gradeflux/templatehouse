const BASE = process.env.PAYPAL_BASE_URL ?? "https://api-m.paypal.com";

export async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function createOrder(amountUsd: string, description: string, customId: string) {
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessToken()}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amountUsd }, description, custom_id: customId }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal order 생성 실패: ${JSON.stringify(data)}`);
  return data as { id: string };
}

export async function captureOrder(orderId: string) {
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessToken()}` },
  });
  const data = await res.json();
  if (!res.ok || data.status !== "COMPLETED") throw new Error(`PayPal capture 실패: ${JSON.stringify(data)}`);
  return data;
}

// 구독 플랜 (PayPal Subscriptions API)
export async function createSubscriptionOrder(planId: string, customId: string) {
  const res = await fetch(`${BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessToken()}` },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: customId,
      application_context: {
        brand_name: "TemplateHouse",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?sub=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?sub=cancel`,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal 구독 생성 실패: ${JSON.stringify(data)}`);
  return data as { id: string; links: { href: string; rel: string }[] };
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
  });
  return res.json();
}

export async function cancelSubscription(subscriptionId: string, reason: string) {
  await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getAccessToken()}` },
    body: JSON.stringify({ reason }),
  });
}
