import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ReceiptItem,
  StoredReceipt,
  isStoredReceipt,
} from "@/lib/receipts";

const RECEIPTS_FILE = path.join(process.cwd(), "data", "receipts.json");

async function ensureStoreFile() {
  await mkdir(path.dirname(RECEIPTS_FILE), { recursive: true });

  try {
    await readFile(RECEIPTS_FILE, "utf8");
  } catch {
    await writeFile(RECEIPTS_FILE, "[]\n", "utf8");
  }
}

async function readReceiptStore(): Promise<StoredReceipt[]> {
  await ensureStoreFile();

  try {
    const raw = await readFile(RECEIPTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredReceipt);
  } catch {
    return [];
  }
}

async function writeReceiptStore(receipts: StoredReceipt[]) {
  await ensureStoreFile();

  const nextRaw = `${JSON.stringify(receipts, null, 2)}\n`;
  const tempFile = `${RECEIPTS_FILE}.tmp`;
  await writeFile(tempFile, nextRaw, "utf8");
  await rename(tempFile, RECEIPTS_FILE);
}

export async function listReceipts(filters: {
  employeeId: string;
  customerNumber?: string;
}) {
  const allReceipts = await readReceiptStore();

  return allReceipts.filter((receipt) => {
    if (receipt.employeeId !== filters.employeeId) {
      return false;
    }

    if (filters.customerNumber && receipt.customerNumber !== filters.customerNumber) {
      return false;
    }

    return true;
  });
}

export async function createReceipt(input: {
  employeeId: string;
  customerNumber: string;
  items: ReceiptItem[];
}) {
  const allReceipts = await readReceiptStore();
  const normalizedItems: ReceiptItem[] = input.items.map((item) => ({
    barcode: item.barcode.trim(),
    timestamp: item.timestamp,
  }));

  const receipt: StoredReceipt = {
    receiptId: `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: Date.now(),
    itemCount: normalizedItems.length,
    customerNumber: input.customerNumber,
    employeeId: input.employeeId,
    items: normalizedItems,
  };

  await writeReceiptStore([receipt, ...allReceipts]);
  return receipt;
}
