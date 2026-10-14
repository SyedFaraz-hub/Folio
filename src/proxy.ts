import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Optimistic auth gate (Next 16 `proxy`, formerly middleware). It only checks the signed cookie;
 * every route handler still loads the user and enforces document access itself.
 * Signed-in users hitting /login are redirected by the page (DB-backed), not here, so a cookie
 * for a user that no longer exists (e.g. after re-seeding) can't cause a redirect loop.
 */
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/accounts"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic || userId) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return Response.json(
      { error: { code: "unauthorized", message: "Sign in to continue." } },
      { status: 401 },
    );
  }
  const login = new URL("/login", req.url);
  if (pathname !== "/") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  // Everything except Next internals and static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
