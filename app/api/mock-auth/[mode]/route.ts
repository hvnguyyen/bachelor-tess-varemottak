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

  const idToken = `mock-id-token-${mode}-${Date.now()}`;
  const accessToken = MOCK_ACCESS_TOKEN;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  const externalOrigin =
    forwardedProto && forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : request.nextUrl.origin;

  const redirectUrl = new URL("/login", externalOrigin);
  redirectUrl.searchParams.set("mockAuth", "success");
  redirectUrl.searchParams.set("mode", mode);
  redirectUrl.searchParams.set("idToken", idToken);
  redirectUrl.searchParams.set("accessToken", accessToken);

  return NextResponse.redirect(redirectUrl);
}
