import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE = "mpa_access";
const DAYS = 365;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is missing or shorter than 32 characters.");
  return s;
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

// Signed token that proves "this browser paid" (verified against Whop before it is ever issued).
export function signAccess(paymentId: string): string {
  const payload = b64(JSON.stringify({ p: paymentId, e: Date.now() + DAYS * 24 * 60 * 60 * 1000 }));
  return `${payload}.${sign(payload)}`;
}

export function verifyAccess(token: string | undefined | null): { paymentId: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.p !== "string" || typeof data.e !== "number" || data.e < Date.now()) return null;
    return { paymentId: data.p };
  } catch {
    return null;
  }
}

// Local development only: set DEV_UNLOCK=true in .env.local to skip payment while testing.
// Never active in production builds (Vercel sets NODE_ENV=production).
export const devUnlock = () => process.env.NODE_ENV !== "production" && process.env.DEV_UNLOCK === "true";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DAYS * 24 * 60 * 60,
};
