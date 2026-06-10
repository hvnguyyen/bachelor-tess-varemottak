import { NextRequest, NextResponse } from "next/server";
import { isMockApiMode, MOCK_ACCESS_TOKEN } from "@/lib/apiMode";

type Context = {
  params: Promise<{ mode: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { mode } = await context.params;

  if (!isMockApiMode()) {
    return NextResponse.json({ message: "Mock auth is disabled" }, { status: 404 });
  }

  if (mode !== "tenant" && mode !== "sso") {
    return NextResponse.json({ message: "Invalid auth mode" }, { status: 400 });
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  const externalOrigin =
    forwardedProto && forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : request.nextUrl.origin;

  // Set the session cookie directly on the redirect — no tokens in the URL.
  const response = NextResponse.redirect(new URL("/auth/complete", externalOrigin));

  response.cookies.set("accessToken", MOCK_ACCESS_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours (one shift)
  });

  return response;
}
