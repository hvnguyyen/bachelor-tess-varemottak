export type ReceiptItem = {
  barcode: string;
  timestamp: number;
};

export type CreateReceiptRequest = {
  employeeId: string;
  customerNumber: string;
  items: ReceiptItem[];
};

export type CreateReceiptSuccessResponse = {
  ok: true;
  receiptId?: string;
  itemCount?: number;
};

export type CreateReceiptErrorResponse = {
  ok: false;
  message: string;
};

export type CreateReceiptResponse = CreateReceiptSuccessResponse | CreateReceiptErrorResponse;

export type GetReceiptsSuccessResponse = {
  ok: true;
  receipts: StoredReceipt[];
};

export type GetReceiptsErrorResponse = {
  ok: false;
  message: string;
};

export type GetReceiptsResponse = GetReceiptsSuccessResponse | GetReceiptsErrorResponse;

export type StoredReceipt = {
  receiptId: string;
  submittedAt: number;
  itemCount: number;
  customerNumber: string;
  employeeId: string;
  items: ReceiptItem[];
};

export function isReceiptItem(value: unknown): value is ReceiptItem {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ReceiptItem>;
  return (
    typeof candidate.barcode === "string" &&
    candidate.barcode.trim().length > 0 &&
    typeof candidate.timestamp === "number" &&
    Number.isFinite(candidate.timestamp)
  );
}

export function isCreateReceiptRequest(value: unknown): value is CreateReceiptRequest {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CreateReceiptRequest>;
  return (
    typeof candidate.employeeId === "string" &&
    candidate.employeeId.trim().length > 0 &&
    typeof candidate.customerNumber === "string" &&
    candidate.customerNumber.trim().length > 0 &&
    Array.isArray(candidate.items) &&
    candidate.items.every(isReceiptItem)
  );
}

export function isStoredReceipt(value: unknown): value is StoredReceipt {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredReceipt>;
  return (
    typeof candidate.receiptId === "string" &&
    typeof candidate.submittedAt === "number" &&
    Number.isFinite(candidate.submittedAt) &&
    typeof candidate.itemCount === "number" &&
    Number.isFinite(candidate.itemCount) &&
    typeof candidate.customerNumber === "string" &&
    typeof candidate.employeeId === "string" &&
    Array.isArray(candidate.items) &&
    candidate.items.every(isReceiptItem)
  );
}
