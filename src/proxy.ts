import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  // --- Admin area ---
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin") {
      if (isAdmin) return NextResponse.redirect(new URL("/admin/dashboard", origin));
      return NextResponse.next();
    }
    if (!isAdmin) return NextResponse.redirect(new URL("/admin", origin));
    return NextResponse.next();
  }

  // --- Customer account area (login page is public) ---
  if (pathname.startsWith("/account")) {
    if (pathname === "/account/login") {
      if (isCustomer) return NextResponse.redirect(new URL("/account", origin));
      return NextResponse.next();
    }
    if (!isCustomer)
      return NextResponse.redirect(new URL("/account/login", origin));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
