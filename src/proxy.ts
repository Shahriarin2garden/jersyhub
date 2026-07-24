import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protect everything under /admin except the login page itself.
  const isProtected = pathname.startsWith("/admin") && pathname !== "/admin";

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  // Already logged in → skip login page.
  if (pathname === "/admin" && isLoggedIn) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", req.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
