"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CreateReceiptResponse,
  GetReceiptsResponse,
  ReceiptItem,
  isReceiptItem,
} from "@/lib/receipts";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";

import Link from "next/link";
import AppHeader from "@/features/shared/components/AppHeader";
import Scanner from "./components/Scanner";
import ManualEntry from "./components/ManualEntry";
import ItemsList from "./components/ItemsList";
import OrdersOverview from "./components/OrdersOverview";
import ReceiptConfirmationModal from "./components/ReceiptConfirmationModal";

const DRAFT_STORAGE_PREFIX = "goods-receipt-draft";

function getDraftStorageKey(employeeId: string, customerNumber: string) {
  return `${DRAFT_STORAGE_PREFIX}:${employeeId}:${customerNumber}`;
}

function loadDraftItems(storageKey: string): ReceiptItem[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isReceiptItem);
  } catch {
    return [];
  }
}

function saveDraftItems(storageKey: string, nextItems: ReceiptItem[]) {
  try {
    if (nextItems.length === 0) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}

export default function GoodsReceiptPage() {
  const router = useRouter();
  const { profile, isReady } = useRequiredUserProfile();

  const [hasReceiptHistory, setHasReceiptHistory] = useState(false);

  const [employeeId, setEmployeeId] = useState("Ukjent bruker");
  const [customerNumber, setCustomerNumber] = useState<string | null>(null);
  const [availableCustomerNumbers, setAvailableCustomerNumbers] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [draftStorageKey, setDraftStorageKey] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [receiptModeOpen, setReceiptModeOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const loadHasReceiptHistory = useCallback(async (nextEmployeeId: string) => {
    try {
      const query = new URLSearchParams({ employeeId: nextEmployeeId });
      const response = await fetch(`/api/receipts?${query.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        setHasReceiptHistory(false);
        return;
      }

      const result = (await response.json().catch(() => null)) as GetReceiptsResponse | null;
      setHasReceiptHistory(Boolean(result?.ok && result.receipts.length > 0));
    } catch {
      setHasReceiptHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setEmployeeId(profile.employeeId);
    setAvailableCustomerNumbers(profile.customerNumbers);
    setCustomerNumber(profile.defaultCustomerNumber ?? profile.customerNumbers[0] ?? null);
  }, [profile]);

  useEffect(() => {
    if (!profile?.employeeId) {
      setHasReceiptHistory(false);
      return;
    }

    void loadHasReceiptHistory(profile.employeeId);
  }, [loadHasReceiptHistory, profile?.employeeId]);

  useEffect(() => {
    if (!profile?.employeeId || !customerNumber) {
      setDraftStorageKey(null);
      setHasLoadedDraft(false);
      return;
    }

    const nextStorageKey = getDraftStorageKey(profile.employeeId, customerNumber);
    const draftItems = loadDraftItems(nextStorageKey);

    setDraftStorageKey(nextStorageKey);
    setItems(draftItems);
    setHasLoadedDraft(true);

    if (draftItems.length > 0) {
      setReceiptModeOpen(true);
      setScannerActive(true);
      setShowManualEntry(true);
    }
  }, [customerNumber, profile?.employeeId]);

  useEffect(() => {
    if (!draftStorageKey || !hasLoadedDraft) {
      return;
    }

    saveDraftItems(draftStorageKey, items);
  }, [draftStorageKey, hasLoadedDraft, items]);

  const addItem = (barcode: string) => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return;

    if (items.some((item) => item.barcode === trimmedBarcode)) {
      setError(`Strekkode ${trimmedBarcode} er allerede registrert`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setItems((prev) => [{ barcode: trimmedBarcode, timestamp: Date.now() }, ...prev]);
    setError("");
    setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleBarcodeScanned = (barcode: string) => {
    addItem(barcode);
  };

  const manualRegister = (code?: string) => {
    setError("");
    setSuccess("");
    const trimmedBarcode = (code ?? manualCode).trim();

    if (!trimmedBarcode) {
      setError("Vennligst skriv inn en strekkode");
      return;
    }

    addItem(trimmedBarcode);
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
    setIsClearConfirmOpen(true);
  };

  const executeClearAll = () => {
    setIsClearConfirmOpen(false);
    setItems([]);
    setSuccess("Alle varer slettet");
    setTimeout(() => setSuccess(""), 2000);
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
    if (isSubmitting) return;
    setIsConfirmModalOpen(false);
  };

  const submitReceipt = async () => {
    if (!customerNumber || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, customerNumber, items }),
      });

      const result = (await response.json().catch(() => null)) as CreateReceiptResponse | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result && "message" in result ? result.message : "Ugyldig svar fra server"
        );
      }

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

  if (!isReady || !profile) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-tess-surface to-white">
      <AppHeader />
      <div className="max-w-6xl mx-auto p-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Varemottak</h1>
          {receiptModeOpen ? (
            <button
              type="button"
              onClick={toggleReceiptMode}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
            >
              Tilbake
            </button>
          ) : (
            <Link href="/dashboard" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Tilbake</Link>
          )}
        </div>

        {!receiptModeOpen ? (
          <div className="mb-6 flex flex-col gap-6">
            <div
              onClick={toggleReceiptMode}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleReceiptMode();
                }
              }}
              role="button"
              tabIndex={0}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 cursor-pointer p-6 transition hover:ring-tess-green-soft focus:outline-none focus:ring-2 focus:ring-tess-green-soft"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-tess-green-dark">
                    {items.length > 0 ? "Fortsett varemottak" : "Start varemottak"}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {items.length > 0
                      ? "Trykk for å fortsette varemottak"
                      : "Trykk for å starte skanning av kolli"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Skann eller registrer manuelt.
                  </p>
                </div>

                {hasReceiptHistory ? (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void openReceiptHistory();
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                    >
                      Se tidligere registrerte varemottak
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {customerNumber ? (
              <div className="[&>section]:mb-0">
                <OrdersOverview customerNumber={customerNumber} />
              </div>
            ) : null}
          </div>
        ) : null}

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
                <div className="mt-4 bg-tess-green-light border border-tess-green-soft text-tess-green-dark px-4 py-3 rounded-lg">{success}</div>
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

        {!receiptModeOpen && !customerNumber ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            Fant ikke kundenummer for innlogget bruker. Logg inn på nytt for å hente riktig kundegrunnlag.
          </div>
        ) : null}
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

      {isClearConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Slett alle varer?</h2>
            <p className="mt-2 text-sm text-gray-600">
              {items.length} strekkode{items.length !== 1 ? "r" : ""} vil bli slettet. Denne handlingen kan ikke angres.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={executeClearAll}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Slett alle
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
