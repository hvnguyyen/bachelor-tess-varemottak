"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GetReceiptsResponse,
  StoredReceipt,
} from "@/lib/receipts";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("no-NO");
}

export default function ReceiptHistoryPage() {
  const { profile, isReady } = useRequiredUserProfile();
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<StoredReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.employeeId) {
      setReceipts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadReceipts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const query = new URLSearchParams({ employeeId: profile.employeeId });
        const response = await fetch(`/api/receipts?${query.toString()}`, {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => null)) as GetReceiptsResponse | null;

        if (!response.ok || !result?.ok) {
          throw new Error(
            result && "message" in result ? result.message : "Kunne ikke hente varemottak"
          );
        }

        if (!cancelled) {
          setReceipts(result.receipts);
        }
      } catch (err) {
        if (!cancelled) {
          setReceipts([]);
          setError(err instanceof Error ? err.message : "Kunne ikke hente varemottak");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReceipts();

    return () => {
      cancelled = true;
    };
  }, [profile?.employeeId]);

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
              Viser lagrede mottak for innlogget bruker.
            </p>
          </div>
          <Link
            href="/goods-receipt"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake til varemottak
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 text-center text-gray-600">
            Henter lagrede varemottak...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-red-200 p-8 text-center text-red-700">
            {error}
          </div>
        ) : sortedReceipts.length === 0 ? (
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
