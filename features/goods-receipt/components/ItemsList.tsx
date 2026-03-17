"use client";

import { ReceiptItem } from "@/lib/receipts";

type Props = {
  items: ReceiptItem[];
  removeItem: (index: number) => void;
  clearAll: () => void;
  submitReceipt: () => void;
  isSubmitting: boolean;
};

export default function ItemsList({ items, removeItem, clearAll, submitReceipt, isSubmitting }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Registrerte varer ({items.length})</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm mb-4">Ingen varer registrert ennå</p>
      ) : (
        <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-base text-gray-800 break-all font-semibold">{item.barcode}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleTimeString("no-NO")}</p>
              </div>
              <button onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700 font-semibold text-sm px-2 py-1">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 pt-4 border-t">
        <button onClick={submitReceipt} disabled={items.length === 0 || isSubmitting} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition">
          {isSubmitting ? "Registrerer..." : "Registrer mottak"}
        </button>
        <button onClick={clearAll} disabled={items.length === 0 || isSubmitting} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition">Slett alt</button>
      </div>
    </div>
  );
}
