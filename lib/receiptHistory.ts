import { isStoredReceipt, StoredReceipt } from "@/lib/receipts";

const STORAGE_KEY = "receiptHistory";
const RECEIPT_HISTORY_EVENT = "receipt-history-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

export function parseReceiptHistory(raw: string | null): StoredReceipt[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredReceipt[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredReceipt);
  } catch {
    return [];
  }
}

export function getReceiptHistorySnapshot(): string {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function getReceiptHistory(): StoredReceipt[] {
  return parseReceiptHistory(getReceiptHistorySnapshot());
}

export function saveReceiptHistory(receipts: StoredReceipt[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  window.dispatchEvent(new Event(RECEIPT_HISTORY_EVENT));
}

export function addReceiptToHistory(receipt: StoredReceipt) {
  const current = getReceiptHistory();
  const next = [receipt, ...current];
  saveReceiptHistory(next);
  return next;
}

export function subscribeReceiptHistory(onStoreChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(RECEIPT_HISTORY_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RECEIPT_HISTORY_EVENT, onStoreChange);
  };
}
