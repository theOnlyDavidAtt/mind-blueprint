import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, devUnlock, verifyAccess } from "@/lib/access";

// Tells the browser whether this visitor has paid. The answer comes from a signed cookie, never from the URL.
export async function GET(req: NextRequest) {
  let unlocked = devUnlock();
  if (!unlocked) {
    try {
      unlocked = !!verifyAccess(req.cookies.get(ACCESS_COOKIE)?.value);
    } catch {
      unlocked = false;
    }
  }
  return NextResponse.json({ unlocked }, { headers: { "Cache-Control": "no-store" } });
}
