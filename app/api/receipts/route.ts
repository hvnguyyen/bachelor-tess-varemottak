import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  console.log("POST /api/receipts", body);

  return NextResponse.json({
    ok: true,
    message: "Mock receipt registered",
  });
}
