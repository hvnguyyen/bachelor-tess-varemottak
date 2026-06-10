import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import {
  ReceiptItem,
  StoredReceipt,
  isStoredReceipt,
} from "@/lib/receipts";

const RECEIPTS_FILE = path.join(process.cwd(), "data", "receipts.json");
const STORE_VERSION = 1;

type ReceiptStoreSnapshot = {
  version: number;
  updatedAt: number;
  receipts: StoredReceipt[];
};

declare global {
  var __receiptStorePool: Pool | undefined;
}

let storeQueue: Promise<void> = Promise.resolve();
let schemaInitPromise: Promise<void> | null = null;
let migrationPromise: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

function hasDatabase() {
  return getDatabaseUrl().length > 0;
}

function getPool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL er ikke satt");
  }

  if (!globalThis.__receiptStorePool) {
    globalThis.__receiptStorePool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalThis.__receiptStorePool;
}

function createEmptySnapshot(): ReceiptStoreSnapshot {
  return {
    version: STORE_VERSION,
    updatedAt: Date.now(),
    receipts: [],
  };
}

function isReceiptStoreSnapshot(value: unknown): value is ReceiptStoreSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ReceiptStoreSnapshot>;
  return (
    candidate.version === STORE_VERSION &&
    typeof candidate.updatedAt === "number" &&
    Number.isFinite(candidate.updatedAt) &&
    Array.isArray(candidate.receipts) &&
    candidate.receipts.every(isStoredReceipt)
  );
}

function normalizeReceipt(receipt: StoredReceipt): StoredReceipt {
  const normalizedItems = receipt.items.map((item) => ({
    barcode: item.barcode.trim(),
    timestamp: item.timestamp,
  }));

  return {
    receiptId: receipt.receiptId.trim(),
    submittedAt: receipt.submittedAt,
    itemCount: normalizedItems.length,
    customerNumber: receipt.customerNumber.trim(),
    employeeId: receipt.employeeId.trim(),
    items: normalizedItems,
  };
}

function sortReceipts(receipts: StoredReceipt[]) {
  return [...receipts].sort((a, b) => b.submittedAt - a.submittedAt);
}

async function withStoreLock<T>(task: () => Promise<T>): Promise<T> {
  const run = storeQueue.then(task, task);
  storeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensureStoreFile() {
  await mkdir(path.dirname(RECEIPTS_FILE), { recursive: true });

  try {
    await readFile(RECEIPTS_FILE, "utf8");
  } catch {
    const nextRaw = `${JSON.stringify(createEmptySnapshot(), null, 2)}\n`;
    await writeFile(RECEIPTS_FILE, nextRaw, "utf8");
  }
}

async function resetCorruptStore(raw: string) {
  const corruptFile = `${RECEIPTS_FILE}.corrupt-${Date.now()}.json`;
  await copyFile(RECEIPTS_FILE, corruptFile).catch(() => undefined);

  if (raw.trim().length > 0) {
    await writeFile(corruptFile, raw, "utf8").catch(() => undefined);
  }

  const nextRaw = `${JSON.stringify(createEmptySnapshot(), null, 2)}\n`;
  await writeFile(RECEIPTS_FILE, nextRaw, "utf8");
}

async function writeReceiptStore(snapshot: ReceiptStoreSnapshot) {
  await ensureStoreFile();

  const nextRaw = `${JSON.stringify(snapshot, null, 2)}\n`;
  const tempFile = `${RECEIPTS_FILE}.tmp`;
  await writeFile(tempFile, nextRaw, "utf8");
  await rename(tempFile, RECEIPTS_FILE);
}

async function readReceiptStore(): Promise<ReceiptStoreSnapshot> {
  await ensureStoreFile();

  const raw = await readFile(RECEIPTS_FILE, "utf8").catch(() => "");

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      const migratedReceipts = sortReceipts(parsed.filter(isStoredReceipt).map(normalizeReceipt));
      const migratedSnapshot: ReceiptStoreSnapshot = {
        version: STORE_VERSION,
        updatedAt: Date.now(),
        receipts: migratedReceipts,
      };
      await writeReceiptStore(migratedSnapshot);
      return migratedSnapshot;
    }

    if (isReceiptStoreSnapshot(parsed)) {
      const normalizedSnapshot: ReceiptStoreSnapshot = {
        version: STORE_VERSION,
        updatedAt: parsed.updatedAt,
        receipts: sortReceipts(parsed.receipts.map(normalizeReceipt)),
      };
      return normalizedSnapshot;
    }

    await resetCorruptStore(raw);
    return createEmptySnapshot();
  } catch {
    await resetCorruptStore(raw);
  return createEmptySnapshot();
  }
}

async function ensureDatabaseSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS receipts (
          receipt_id TEXT PRIMARY KEY,
          submitted_at BIGINT NOT NULL,
          item_count INTEGER NOT NULL,
          customer_number TEXT NOT NULL,
          employee_id TEXT NOT NULL
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS receipt_items (
          id BIGSERIAL PRIMARY KEY,
          receipt_id TEXT NOT NULL REFERENCES receipts(receipt_id) ON DELETE CASCADE,
          barcode TEXT NOT NULL,
          scanned_at BIGINT NOT NULL
        );
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS receipts_employee_idx
        ON receipts (employee_id, submitted_at DESC);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS receipts_customer_idx
        ON receipts (customer_number, submitted_at DESC);
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS receipt_items_receipt_idx
        ON receipt_items (receipt_id);
      `);
    })();
  }

  return schemaInitPromise;
}

async function migrateFileStoreToDatabase() {
  if (!hasDatabase()) {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      await ensureDatabaseSchema();

      const pool = getPool();
      const countResult = await pool.query<{ count: string }>("SELECT COUNT(*) AS count FROM receipts");
      const hasRows = Number(countResult.rows[0]?.count ?? 0) > 0;

      if (hasRows) {
        return;
      }

      const snapshot = await readReceiptStore();
      if (snapshot.receipts.length === 0) {
        return;
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const receipt of snapshot.receipts) {
          await client.query(
            `
              INSERT INTO receipts (receipt_id, submitted_at, item_count, customer_number, employee_id)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (receipt_id) DO NOTHING
            `,
            [
              receipt.receiptId,
              receipt.submittedAt,
              receipt.itemCount,
              receipt.customerNumber,
              receipt.employeeId,
            ]
          );

          for (const item of receipt.items) {
            await client.query(
              `
                INSERT INTO receipt_items (receipt_id, barcode, scanned_at)
                VALUES ($1, $2, $3)
              `,
              [receipt.receiptId, item.barcode, item.timestamp]
            );
          }
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })();
  }

  return migrationPromise;
}

async function listReceiptsFromDatabase(filters: {
  employeeId: string;
  customerNumber?: string;
}) {
  await ensureDatabaseSchema();
  await migrateFileStoreToDatabase();

  const pool = getPool();
  const values: Array<string | number> = [filters.employeeId.trim()];
  let whereClause = "WHERE employee_id = $1";

  if (filters.customerNumber?.trim()) {
    values.push(filters.customerNumber.trim());
    whereClause += ` AND customer_number = $${values.length}`;
  }

  const receiptsResult = await pool.query<{
    receipt_id: string;
    submitted_at: string | number;
    item_count: number;
    customer_number: string;
    employee_id: string;
  }>(
    `
      SELECT receipt_id, submitted_at, item_count, customer_number, employee_id
      FROM receipts
      ${whereClause}
      ORDER BY submitted_at DESC
    `,
    values
  );

  if (receiptsResult.rows.length === 0) {
    return [];
  }

  const receiptIds = receiptsResult.rows.map(
    (row: {
      receipt_id: string;
      submitted_at: string | number;
      item_count: number;
      customer_number: string;
      employee_id: string;
    }) => row.receipt_id
  );
  const itemResult = await pool.query<{
    receipt_id: string;
    barcode: string;
    scanned_at: string | number;
  }>(
    `
      SELECT receipt_id, barcode, scanned_at
      FROM receipt_items
      WHERE receipt_id = ANY($1::text[])
      ORDER BY scanned_at ASC
    `,
    [receiptIds]
  );

  const itemsByReceiptId = new Map<string, ReceiptItem[]>();
  for (const row of itemResult.rows) {
    const items = itemsByReceiptId.get(row.receipt_id) ?? [];
    items.push({
      barcode: row.barcode,
      timestamp: Number(row.scanned_at),
    });
    itemsByReceiptId.set(row.receipt_id, items);
  }

  return receiptsResult.rows.map((row: {
    receipt_id: string;
    submitted_at: string | number;
    item_count: number;
    customer_number: string;
    employee_id: string;
  }) => ({
    receiptId: row.receipt_id,
    submittedAt: Number(row.submitted_at),
    itemCount: row.item_count,
    customerNumber: row.customer_number,
    employeeId: row.employee_id,
    items: itemsByReceiptId.get(row.receipt_id) ?? [],
  }));
}

async function createReceiptInDatabase(input: {
  employeeId: string;
  customerNumber: string;
  items: ReceiptItem[];
}) {
  await ensureDatabaseSchema();
  await migrateFileStoreToDatabase();

  const normalizedItems: ReceiptItem[] = input.items.map((item) => ({
    barcode: item.barcode.trim(),
    timestamp: item.timestamp,
  }));

  const receipt: StoredReceipt = {
    receiptId: `receipt-${randomUUID()}`,
    submittedAt: Date.now(),
    itemCount: normalizedItems.length,
    customerNumber: input.customerNumber.trim(),
    employeeId: input.employeeId.trim(),
    items: normalizedItems,
  };

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO receipts (receipt_id, submitted_at, item_count, customer_number, employee_id)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        receipt.receiptId,
        receipt.submittedAt,
        receipt.itemCount,
        receipt.customerNumber,
        receipt.employeeId,
      ]
    );

    for (const item of receipt.items) {
      await client.query(
        `
          INSERT INTO receipt_items (receipt_id, barcode, scanned_at)
          VALUES ($1, $2, $3)
        `,
        [receipt.receiptId, item.barcode, item.timestamp]
      );
    }

    await client.query("COMMIT");
    return receipt;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listReceipts(filters: {
  employeeId: string;
  customerNumber?: string;
}) {
  if (hasDatabase()) {
    try {
      return await listReceiptsFromDatabase(filters);
    } catch (error) {
      console.warn("Could not read receipts from database, falling back to file store:", error);
    }
  }

  return withStoreLock(async () => {
    const snapshot = await readReceiptStore();

    return snapshot.receipts.filter((receipt) => {
      if (receipt.employeeId !== filters.employeeId.trim()) {
        return false;
      }

      if (filters.customerNumber && receipt.customerNumber !== filters.customerNumber.trim()) {
        return false;
      }

      return true;
    });
  });
}

export async function createReceipt(input: {
  employeeId: string;
  customerNumber: string;
  items: ReceiptItem[];
}) {
  if (hasDatabase()) {
    try {
      return await createReceiptInDatabase(input);
    } catch (error) {
      console.warn("Could not write receipt to database, falling back to file store:", error);
    }
  }

  return withStoreLock(async () => {
    const snapshot = await readReceiptStore();
    const normalizedItems: ReceiptItem[] = input.items.map((item) => ({
      barcode: item.barcode.trim(),
      timestamp: item.timestamp,
    }));

    const receipt: StoredReceipt = {
      receiptId: `receipt-${randomUUID()}`,
      submittedAt: Date.now(),
      itemCount: normalizedItems.length,
      customerNumber: input.customerNumber.trim(),
      employeeId: input.employeeId.trim(),
      items: normalizedItems,
    };

    const nextSnapshot: ReceiptStoreSnapshot = {
      version: STORE_VERSION,
      updatedAt: Date.now(),
      receipts: sortReceipts([receipt, ...snapshot.receipts]),
    };

    await writeReceiptStore(nextSnapshot);
    return receipt;
  });
}
