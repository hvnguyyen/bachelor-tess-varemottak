import { NextRequest, NextResponse } from "next/server";
import {
  CreateReceiptErrorResponse,
  CreateReceiptRequest,
  CreateReceiptSuccessResponse,
  GetReceiptsErrorResponse,
  GetReceiptsSuccessResponse,
  isCreateReceiptRequest,
} from "@/lib/receipts";
import { createReceipt, listReceipts } from "@/lib/server/receiptStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId")?.trim() ?? "";
  const customerNumber = searchParams.get("customerNumber")?.trim() ?? "";

  if (!employeeId) {
    return NextResponse.json<GetReceiptsErrorResponse>(
      { ok: false, message: "Mangler employeeId" },
      { status: 400 }
    );
  }

  const receipts = await listReceipts({
    employeeId,
    customerNumber: customerNumber || undefined,
  });

  return NextResponse.json<GetReceiptsSuccessResponse>({
    ok: true,
    receipts,
  });
}

export async function POST(request: NextRequest) {
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

  const payload = body as CreateReceiptRequest;
  const storedReceipt = await createReceipt({
    employeeId: payload.employeeId.trim(),
    customerNumber: payload.customerNumber.trim(),
    items: payload.items,
  });

  const response: CreateReceiptSuccessResponse = {
    ok: true,
    receiptId: storedReceipt.receiptId,
    itemCount: storedReceipt.itemCount,
  };

  return NextResponse.json(response);
}
