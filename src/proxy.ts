import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  // Skip static files, auth callbacks, and stripe webhooks
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/api/stripe/webhook") ||
    request.nextUrl.pathname === "/manifest.json" ||
    request.nextUrl.pathname === "/favicon.svg" ||
    request.nextUrl.pathname === "/sw.js"
  ) {
    return;
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|manifest.json|sw.js|icons/).*)"],
};
