export type ReceiptItem = {
  barcode: string;
  timestamp: number;
};

export type CreateReceiptRequest = {
  items: ReceiptItem[];
};

export type CreateReceiptResponse = {
  ok: boolean;
  message: string;
  receiptId?: string;
  itemCount?: number;
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
  return Array.isArray(candidate.items) && candidate.items.every(isReceiptItem);
}
