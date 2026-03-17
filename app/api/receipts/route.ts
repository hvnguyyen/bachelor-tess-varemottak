import { NextResponse } from "next/server";
import {
  CreateReceiptResponse,
  isCreateReceiptRequest,
} from "@/lib/receipts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isCreateReceiptRequest(body) || body.items.length === 0) {
    return NextResponse.json<CreateReceiptResponse>(
      {
        ok: false,
        message: "Ugyldig payload. Minst én strekkode må være registrert.",
      },
      { status: 400 }
    );
  }

  const normalizedItems = body.items.map((item) => ({
    barcode: item.barcode.trim(),
    timestamp: item.timestamp,
  }));

  console.log("POST /api/receipts", {
    itemCount: normalizedItems.length,
    items: normalizedItems,
  });

  const response: CreateReceiptResponse = {
    ok: true,
    message: `Mock receipt registered with ${normalizedItems.length} item(s)`,
    receiptId: `mock-receipt-${Date.now()}`,
    itemCount: normalizedItems.length,
  };

  return NextResponse.json(response);
}
