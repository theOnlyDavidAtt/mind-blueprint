// Client-side helpers for the paywall: reading the checkout return link and confirming a payment.

export const PENDING_KEY = "mpa_pending_payment"; // paid, not yet confirmed by our server
export const PAYMENT_KEY = "mpa_payment"; // confirmed payment id (used for the "open in browser" link)

export const ls = {
  get(k: string) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* storage may be blocked */
    }
  },
  del(k: string) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

// Params Whop (and older versions of this app) append to the return link.
const RETURN_PARAMS = ["mpa", "payment", "payment_id", "receipt_id", "status", "state_id", "paid", "setup", "session"];

export type ReturnInfo = {
  /** encoded quiz result we put into the return link */
  mpa: string | null;
  /** pay_… id, if the visitor just came back from checkout */
  paymentId: string | null;
  /** true when Whop reports the off-site step as failed or canceled */
  failed: boolean;
};

/** Reads the checkout return link once and removes it from the address bar. */
export function takeReturnParams(): ReturnInfo {
  const sp = new URLSearchParams(window.location.search);
  const paymentId = sp.get("payment") ?? sp.get("payment_id") ?? sp.get("receipt_id");
  const status = (sp.get("status") ?? "").toLowerCase();
  const info: ReturnInfo = {
    mpa: sp.get("mpa"),
    paymentId: paymentId && /^[A-Za-z0-9_-]{5,80}$/.test(paymentId) ? paymentId : null,
    failed: status === "failed" || status === "canceled" || status === "cancelled",
  };
  if (RETURN_PARAMS.some((k) => sp.has(k))) {
    RETURN_PARAMS.forEach((k) => sp.delete(k));
    const q = sp.toString();
    window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
  }
  return info;
}

export type VerifyResult =
  | { ok: true; state: string | null }
  | { ok: false; error: string; retryable: boolean };

/**
 * Asks our server to confirm the payment with Whop. Retries for ~30 s, because a fresh
 * payment can take a few seconds to show up. On success the server sets the access cookie
 * and returns the quiz result that was stored with the payment (if any).
 */
export async function verifyPayment(paymentId: string, tries = 15): Promise<VerifyResult> {
  ls.set(PENDING_KEY, paymentId);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch("/api/whop/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      if (res.ok) {
        const d = await res.json().catch(() => ({}));
        ls.del(PENDING_KEY);
        ls.set(PAYMENT_KEY, paymentId);
        return { ok: true, state: typeof d.state === "string" ? d.state : null };
      }
      if (res.status !== 202) {
        const d = await res.json().catch(() => ({}));
        if (res.status === 403) ls.del(PENDING_KEY); // definitely not paid: stop retrying on every visit
        return { ok: false, error: d.error ?? "Verification failed.", retryable: res.status >= 500 };
      }
    } catch {
      /* network hiccup: retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return {
    ok: false,
    error: "We could not confirm your payment yet. Please reload this page in a minute. Your purchase is safe.",
    retryable: true,
  };
}
