"use client";

import { ReceiptItem } from "@/lib/receipts";

type Props = {
  isOpen: boolean;
  items: ReceiptItem[];
  customerNumber: string;
  employeeId: string;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
};

function formatDateTime(value: number) {
  return new Date(value).toLocaleString("no-NO");
}

export default function ReceiptConfirmationModal({
  isOpen,
  items,
  customerNumber,
  employeeId,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-tess-green-dark">
            Bekreft mottak
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">
            Klar til å registrere {items.length} kolli
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Kontroller mottaket før innsending til API-ruten.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 md:grid-cols-3">
            <div>
              <p className="font-semibold text-gray-900">Kundenummer</p>
              <p>{customerNumber}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Bruker</p>
              <p>{employeeId}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Antall kolli</p>
              <p>{items.length}</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Registrerte strekkoder
            </h3>
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={`${item.barcode}-${item.timestamp}-${index}`}
                  className="rounded-lg border border-gray-200 px-4 py-3"
                >
                  <p className="font-mono text-sm text-gray-900 break-all">{item.barcode}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Skannet {formatDateTime(item.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-tess-green px-4 py-3 font-semibold text-white transition hover:bg-tess-green-dark disabled:bg-gray-400"
          >
            {isSubmitting ? "Registrerer..." : "Bekreft registrering"}
          </button>
        </div>
      </div>
    </div>
  );
}
