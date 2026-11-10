import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, devUnlock, verifyAccess } from "@/lib/access";

// Tells the browser whether this visitor has paid. The answer comes from a signed cookie, never from the URL.
export async function GET(req: NextRequest) {
  let unlocked = devUnlock();
  let paymentId: string | null = null;
  if (!unlocked) {
    try {
      paymentId = verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value)?.paymentId ?? null;
      unlocked = !!paymentId;
    } catch {
      unlocked = false;
    }
  }
  // paymentId lets the buyer carry their report to another browser (it is re-checked with Whop there).
  return NextResponse.json({ unlocked, paymentId }, { headers: { "Cache-Control": "no-store" } });
}
