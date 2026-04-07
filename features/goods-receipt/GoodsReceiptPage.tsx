"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserProfile } from "@/lib/userProfile";
import { addReceiptToHistory, getReceiptHistory } from "@/lib/receiptHistory";
import { CreateReceiptResponse, ReceiptItem, StoredReceipt } from "@/lib/receipts";

import Link from "next/link";
import Scanner from "./components/Scanner";
import ManualEntry from "./components/ManualEntry";
import ItemsList from "./components/ItemsList";
import OrdersOverview from "./components/OrdersOverview";
import ReceiptConfirmationModal from "./components/ReceiptConfirmationModal";

export default function GoodsReceiptPage() {
  const router = useRouter();

  const [hasReceiptHistory, setHasReceiptHistory] = useState(false);

  const [employeeId, setEmployeeId] = useState("Ukjent bruker");
  const [customerNumber, setCustomerNumber] = useState<string | null>(null);
  const [availableCustomerNumbers, setAvailableCustomerNumbers] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [receiptModeOpen, setReceiptModeOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setHasReceiptHistory(getReceiptHistory().length > 0);

    const profile = getStoredUserProfile();
    if (!profile) {
      setError("Fant ikke bruker. Logg inn på nytt");
      return;
    }
    setEmployeeId(profile.employeeId);
    setAvailableCustomerNumbers(profile.customerNumbers);
    setCustomerNumber(profile.defaultCustomerNumber ?? profile.customerNumbers[0] ?? null);
  }, []);

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
      setIsConfirmModalOpen(false);
      setItems([]);
      setSuccess("Alle varer slettet");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const toggleReceiptMode = () => {
    setReceiptModeOpen((prev) => {
      const next = !prev;
      setScannerActive(next);
      setShowManualEntry(next);
      setError("");
      setSuccess("");
      if (!next) {
        setIsConfirmModalOpen(false);
      }
      return next;
    });
  };

  const openConfirmModal = () => {
    if (!customerNumber) {
      setError("Fant ikke kundenummer for innlogget bruker");
      return;
    }

    if (items.length === 0) {
      setError("Du må registrere minst en vare");
      return;
    }

    setError("");
    setSuccess("");
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsConfirmModalOpen(false);
  };

  const submitReceipt = async () => {
    if (!customerNumber) {
      setError("Fant ikke kundenummer for innlogget bruker");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const result = (await response.json().catch(() => null)) as CreateReceiptResponse | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result && "message" in result ? result.message : "Ugyldig svar fra server");
      }

      const receiptRecord: StoredReceipt = {
        receiptId: result.receiptId || `temp-receipt-${Date.now()}`,
        submittedAt: Date.now(),
        itemCount: items.length,
        customerNumber,
        employeeId,
        items,
      };

      addReceiptToHistory(receiptRecord);
      setHasReceiptHistory(true);
      setSuccess(`Varemottak registrert med ${items.length} kolli`);
      setIsConfirmModalOpen(false);
      setItems([]);
      setTimeout(() => setSuccess(""), 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke registrere mottak");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceiptHistory = async () => {
    setIsConfirmModalOpen(false);
    setScannerActive(false);
    setShowManualEntry(false);
    setReceiptModeOpen(false);
    setError("");
    setSuccess("");

    await new Promise((resolve) => setTimeout(resolve, 150));
    router.push("/receipts");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Varemottak</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Tilbake</Link>
        </div>

        <div className="mb-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Registrere varemottak?</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                {receiptModeOpen ? "Kamera og mottaksregistrering er åpnet" : "Kamera og mottaksregistrering er lukket"}
              </h2>
            </div>

            <button
              onClick={toggleReceiptMode}
              className={`px-4 py-3 rounded-lg font-medium text-white transition ${receiptModeOpen
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {receiptModeOpen ? "Skjul kamera og mottaksregistrering" : "Åpne kamera for mottak av kolli"}
            </button>
          </div>
        </div>

        {receiptModeOpen ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

            <div className="lg:col-span-1">
              {hasReceiptHistory ? (
                <button
                  onClick={() => void openReceiptHistory()}
                  className="mb-4 block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-blue-700"
                >
                  Siste varemottak
                </button>
              ) : null}
              <ItemsList
                items={items}
                removeItem={removeItem}
                clearAll={clearAll}
                submitReceipt={openConfirmModal}
                isSubmitting={isSubmitting}
              />
              {error ? (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              ) : success ? (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {availableCustomerNumbers.length > 1 ? (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Velg kundenummer
            </label>
            <select
              value={customerNumber ?? ""}
              onChange={(event) => setCustomerNumber(event.target.value || null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {availableCustomerNumbers.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {customerNumber ? (
          <OrdersOverview customerNumber={customerNumber} compact={receiptModeOpen} />
        ) : (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            Fant ikke kundenummer for innlogget bruker. Logg inn på nytt for å hente riktig kundegrunnlag.
          </div>
        )}
      </div>

      <ReceiptConfirmationModal
        isOpen={isConfirmModalOpen}
        items={items}
        customerNumber={customerNumber ?? "Ukjent kundenummer"}
        employeeId={employeeId}
        isSubmitting={isSubmitting}
        error={error}
        onClose={closeConfirmModal}
        onConfirm={() => void submitReceipt()}
      />
    </main>
  );
}
