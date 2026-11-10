import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, cookieOptions, signAccess } from "@/lib/access";

const hits = new Map<string, number[]>();
const LIMIT = 30;
const WINDOW_MS = 10 * 60 * 1000;

// The browser only sends a payment/receipt id. We never trust it: we ask Whop directly whether it was paid.
export async function POST(req: NextRequest) {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  recent.push(now);
  hits.set(ip, recent);

  let paymentId = "";
  try {
    const body = await req.json();
    paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  } catch {
    /* fall through */
  }
  if (!/^[A-Za-z0-9_-]{5,80}$/.test(paymentId)) {
    return NextResponse.json({ error: "Invalid payment id." }, { status: 400 });
  }

  const base = process.env.WHOP_API_BASE ?? "https://api.whop.com";
  let res: Response;
  try {
    res = await fetch(`${base}/api/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
  } catch (e) {
    console.error("Whop request failed", e);
    return NextResponse.json({ error: "Could not reach the payment provider." }, { status: 502 });
  }

  // 404 can happen for a few seconds right after checkout: tell the client to retry.
  if (res.status === 404) return NextResponse.json({ pending: true }, { status: 202 });
  if (!res.ok) {
    console.error("Whop API error", res.status, await res.text());
    return NextResponse.json({ error: "Payment lookup failed." }, { status: 502 });
  }

  const p = await res.json();
  const status: string | undefined = p.status;
  if (status && ["pending", "open", "authorized", "draft"].includes(status)) {
    return NextResponse.json({ pending: true }, { status: 202 });
  }
  if (status !== "paid") {
    return NextResponse.json({ error: "Payment not completed." }, { status: 403 });
  }

  // Make sure it was OUR product (otherwise any paid Whop receipt would unlock the app).
  const wanted = process.env.WHOP_PRODUCT_ID;
  const productId: string | undefined = p.product_id ?? p.product?.id;
  if (wanted && productId !== wanted) {
    console.error("Payment is for a different product:", productId);
    return NextResponse.json({ error: "Payment is for a different product." }, { status: 403 });
  }

  // The quiz result travels with the payment as checkout metadata (see Paywall.tsx), so it can be
  // restored even when the buyer lands in a fresh tab or browser after an off-site step (3-D Secure, PayPal, Klarna).
  const meta = p.metadata ?? p.checkout_configuration?.metadata ?? p.membership?.metadata ?? {};
  const state = typeof meta?.mpa === "string" && meta.mpa.length <= 2000 ? meta.mpa : null;

  const out = NextResponse.json({ ok: true, state });
  out.cookies.set(ACCESS_COOKIE, signAccess(paymentId), cookieOptions);
  return out;
}
