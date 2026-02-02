"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

interface ScannedItem {
  barcode: string;
  timestamp: number;
}

export default function GoodsReceiptPage() {
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [scannerActive, setScannerActive] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ barcode: string; time: number } | null>(null);

  const handleBarcodeScanned = (barcode: string) => {
    if (barcode.trim()) {
      const trimmedBarcode = barcode.trim();
      const now = Date.now();

      // Prevent duplicate scans within 1 second
      if (
        lastScannedRef.current &&
        lastScannedRef.current.barcode === trimmedBarcode &&
        now - lastScannedRef.current.time < 1000
      ) {
        return; // Ignore duplicate
      }

      // Check if barcode already exists in items list
      if (items.some((item) => item.barcode === trimmedBarcode)) {
        setError(`Strekkode ${trimmedBarcode} er allerede registrert`);
        setTimeout(() => setError(""), 3000);
        return;
      }

      // Update last scanned
      lastScannedRef.current = { barcode: trimmedBarcode, time: now };

      const newItem: ScannedItem = {
        barcode: trimmedBarcode,
        timestamp: now,
      };

      setItems((prev) => [newItem, ...prev]);
      setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
      setTimeout(() => setSuccess(""), 2000);
      setError("");
    }
  };

  useEffect(() => {
    if (!scannerActive) return;

    const initializeScanner = async () => {
      try {
        // Create new instance each time
        const html5qrcode = new Html5Qrcode("qr-scanner");
        html5QrcodeRef.current = html5qrcode;

        // Define scanner callback with current items
        const onScan = (decodedText: string) => {
          const trimmedBarcode = decodedText.trim();
          const now = Date.now();

          // Check FIRST if this is a recent duplicate
          if (
            lastScannedRef.current &&
            lastScannedRef.current.barcode === trimmedBarcode &&
            now - lastScannedRef.current.time < 2000
          ) {
            return; // Ignore duplicate
          }

          // Update ref immediately to prevent race conditions
          lastScannedRef.current = { barcode: trimmedBarcode, time: now };

          // Now check items and add
          setItems((prevItems) => {
            const isDuplicate = prevItems.some(
              (item) => item.barcode === trimmedBarcode
            );

            if (isDuplicate) {
              setError(`Strekkode allerede registrert`);
              setTimeout(() => setError(""), 2000);
              return prevItems;
            }

            const newItem: ScannedItem = {
              barcode: trimmedBarcode,
              timestamp: now,
            };

            setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
            setTimeout(() => setSuccess(""), 2000);
            setError("");

            return [newItem, ...prevItems];
          });
        };

        await html5qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 400, height: 400 },
          },
          onScan,
          () => {
            // Ignore error messages from scanner
          }
        );

        setIsScannerRunning(true);
        setError("");
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Kunne ikke starte kamera. Sjekk tillatelser.");
        setIsScannerRunning(false);
      }
    };

    initializeScanner();

    return () => {
      const stopScanner = async () => {
        if (html5QrcodeRef.current) {
          try {
            await html5QrcodeRef.current.stop();
            setIsScannerRunning(false);
          } catch (err) {
            console.error("Error stopping scanner:", err);
          }
        }
      };

      stopScanner();
    };
  }, [scannerActive]);

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!manualCode.trim()) {
      setError("Vennligst skriv inn en strekkode");
      return;
    }

    const trimmedBarcode = manualCode.trim();

    // Check if barcode already exists
    if (items.some((item) => item.barcode === trimmedBarcode)) {
      setError(`Strekkode ${trimmedBarcode} er allerede registrert`);
      setManualCode("");
      return;
    }

    const newItem: ScannedItem = {
      barcode: trimmedBarcode,
      timestamp: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    setSuccess(`Strekkode registrert: ${trimmedBarcode}`);
    setTimeout(() => setSuccess(""), 2000);
    setManualCode("");
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

  const submitReceipt = () => {
    if (items.length === 0) {
      setError("Du må registrere minst en vare");
      return;
    }

    // TODO: Send receipt to backend
    console.log("Submitting receipt with items:", items);
    setSuccess(`Varemottak registrert med ${items.length} vare(r)`);

    // Reset after 2 seconds
    setTimeout(() => {
      setItems([]);
      setSuccess("");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Varemottak</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake
          </Link>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {scannerActive ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Skann strekkode
                  </h2>
                  <div
                    id="qr-scanner"
                    className="w-full bg-gray-900 rounded-lg overflow-hidden mb-4"
                    style={{ height: "450px" }}
                  />
                  <button
                    onClick={() => setScannerActive(false)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition mb-3"
                  >
                    Skru av kamera
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Kamera er av
                  </h2>
                  <button
                    onClick={() => setScannerActive(true)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition mb-3"
                  >
                    Skru på kamera
                  </button>
                </>
              )}

              {/* Manual Entry Toggle */}
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
              >
                {showManualEntry
                  ? "Skjul manuell registrering"
                  : "Manuelle registrering"}
              </button>

              {/* Manual Entry Form */}
              {showManualEntry && (
                <form onSubmit={handleManualEntry} className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Skriv inn strekkode"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                    >
                      Legg til
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Items List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Registrerte varer ({items.length})
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">
                  Ingen varer registrert ennå
                </p>
              ) : (
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg flex justify-between items-start gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-base text-gray-800 break-all font-semibold">
                          {item.barcode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleTimeString("no-NO")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <button
                  onClick={submitReceipt}
                  disabled={items.length === 0}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  Registrer mottak
                </button>
                <button
                  onClick={clearAll}
                  disabled={items.length === 0}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  Slett alt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
