import { NextRequest, NextResponse } from "next/server";
import {
  CreateReceiptErrorResponse,
  CreateReceiptSuccessResponse,
  isCreateReceiptRequest,
} from "@/lib/receipts";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json<CreateReceiptErrorResponse>(
      { ok: false, message: "Ikke autentisert" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!isCreateReceiptRequest(body) || body.items.length === 0) {
    return NextResponse.json<CreateReceiptErrorResponse>(
      {
        ok: false,
        message: "Skann minst en strekkode for å registrere et mottak.",
      },
      { status: 400 }
    );
  }

  const normalizedItems = body.items.map((item) => ({
    barcode: item.barcode.trim(),
    timestamp: item.timestamp,
  }));

  const response: CreateReceiptSuccessResponse = {
    ok: true,
    receiptId: `temp-receipt-${Date.now()}`,
    itemCount: normalizedItems.length,
  };

  return NextResponse.json(response);
}
