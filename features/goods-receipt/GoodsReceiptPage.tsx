"use client";

import { useState } from "react";
import Link from "next/link";
import Scanner from "./components/Scanner";
import ManualEntry from "./components/ManualEntry";
import ItemsList from "./components/ItemsList";
import {
  CreateReceiptResponse,
  ReceiptItem,
} from "@/lib/receipts";

export default function GoodsReceiptPage() {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [scannerActive, setScannerActive] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBarcodeScanned = (barcode: string) => {
    if (!barcode.trim()) return;
    const trimmedBarcode = barcode.trim();
    const now = Date.now();

    if (items.some((item) => item.barcode === trimmedBarcode)) {
      setError(`Strekkode ${trimmedBarcode} er allerede registrert`);
      setTimeout(() => setError(""), 3000);
      return;
    }
    const newItem: ReceiptItem = {
      barcode: trimmedBarcode,
      timestamp: now,
    };

    setItems((prev) => [newItem, ...prev]);
    setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
    setTimeout(() => setSuccess(""), 2000);
    setError("");
  };



  const manualRegister = (code?: string) => {
    const trimmedBarcode = (code ?? manualCode).trim();
    setError("");
    setSuccess("");

    if (!trimmedBarcode) {
      setError("Vennligst skriv inn en strekkode");
      return;
    }

    if (items.some((item) => item.barcode === trimmedBarcode)) {
      setError(`Strekkode ${trimmedBarcode} er allerede registrert`);
      setManualCode("");
      return;
    }

    const newItem: ReceiptItem = {
      barcode: trimmedBarcode,
      timestamp: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
    setTimeout(() => setSuccess(""), 2000);
    setManualCode("");
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    manualRegister();
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (confirm("Er du sikker på at du vil slette alle varer?")) {
      setItems([]);
      setSuccess("Alle varer slettet");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const submitReceipt = async () => {
    if (isSubmitting) {
      return;
    }

    if (items.length === 0) {
      setError("Du må registrere minst en vare");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const result = (await response.json().catch(() => null)) as CreateReceiptResponse | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.message || "Ugyldig svar fra API");
      }

      setSuccess(result.message || `Varemottak registrert med ${items.length} vare(r)`);
      setItems([]);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke registrere mottak");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Varemottak</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Tilbake</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <Scanner
              scannerActive={scannerActive}
              setScannerActive={setScannerActive}
              showManualEntry={showManualEntry}
              setShowManualEntry={setShowManualEntry}
              onBarcodeScanned={handleBarcodeScanned}
              setError={setError}
            />

            <ManualEntry manualCode={manualCode} setManualCode={setManualCode} onSubmit={handleManualEntry} showManualEntry={showManualEntry} />
          </div>

          {/* Items List Section */}
          <div className="lg:col-span-1">
            <ItemsList items={items} removeItem={removeItem} clearAll={clearAll} submitReceipt={submitReceipt} isSubmitting={isSubmitting} />
            {error ? (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            ) : success ? (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
