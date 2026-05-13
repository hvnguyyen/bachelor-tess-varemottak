"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getReceiptHistorySnapshot,
  parseReceiptHistory,
  subscribeReceiptHistory,
} from "@/lib/receiptHistory";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("no-NO");
}

export default function ReceiptHistoryPage() {
  const { profile, isReady } = useRequiredUserProfile();
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const historySnapshot = useSyncExternalStore(
    subscribeReceiptHistory,
    getReceiptHistorySnapshot,
    () => ""
  );
  const receipts = useMemo(() => parseReceiptHistory(historySnapshot), [historySnapshot]);

  const sortedReceipts = useMemo(
    () => [...receipts].sort((a, b) => b.submittedAt - a.submittedAt),
    [receipts]
  );

  if (!isReady || !profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Siste varemottak</h1>
            <p className="mt-1 text-sm text-gray-600">
              Viser lokalt lagrede mock-mottak på denne enheten.
            </p>
          </div>
          <Link
            href="/goods-receipt"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake til varemottak
          </Link>
        </div>

        {sortedReceipts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 text-center text-gray-600">
            Ingen varemottak er lagret ennå.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReceipts.map((receipt) => {
              const isOpen = expandedReceiptId === receipt.receiptId;

              return (
                <div key={receipt.receiptId} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedReceiptId(isOpen ? null : receipt.receiptId)}
                    className="w-full text-left p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{receipt.receiptId}</h2>
                        <p className="mt-1 text-sm text-gray-600">
                          Registrert {formatDateTime(receipt.submittedAt)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>{receipt.itemCount} kolli</span>
                          <span>Kunde {receipt.customerNumber}</span>
                          <span>{receipt.employeeId}</span>
                        </div>
                      </div>

                      <span className="text-sm font-medium text-blue-700">
                        {isOpen ? "Skjul detaljer" : "Vis detaljer"}
                      </span>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                        Registrerte varer
                      </h3>
                      <div className="mt-4 space-y-3">
                        {receipt.items.map((item) => (
                          <div
                            key={`${receipt.receiptId}-${item.barcode}-${item.timestamp}`}
                            className="bg-white rounded-lg border border-gray-200 px-4 py-3"
                          >
                            <p className="font-mono text-sm text-gray-900 break-all">{item.barcode}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Skannet {formatDateTime(item.timestamp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
