"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  scannerActive: boolean;
  setScannerActive: (b: boolean) => void;
  showManualEntry: boolean;
  setShowManualEntry: (b: boolean) => void;
  onBarcodeScanned: (code: string) => void;
  setError: (s: string) => void;
};

export default function Scanner({ scannerActive, setScannerActive, showManualEntry, setShowManualEntry, onBarcodeScanned, setError }: Props) {
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onBarcodeScannedRef = useRef(onBarcodeScanned);
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const lastScannedRef = useRef<{ code: string; time: number } | null>(null);
  const stoppingRef = useRef(false);
  const scannerSessionRef = useRef(0);

  useEffect(() => {
    onBarcodeScannedRef.current = onBarcodeScanned;
  }, [onBarcodeScanned]);

  const computeQrboxSize = () => {
    const container = containerRef.current || document.getElementById("qr-scanner");
    const el = container as HTMLElement | null;
    const maxWidth = el ? Math.min(el.clientWidth, 900) : 400;
    const maxHeight = el ? el.clientHeight : 400;
    const size = Math.max(200, Math.floor(Math.min(maxWidth, maxHeight) * 0.95));
    return { width: size, height: size };
  };

  const applyVideoStyles = () => {
    const root = document.getElementById("qr-scanner");
    if (!root) return;
    const video = root.querySelector("video");
    const canvas = root.querySelector("canvas");
    if (video instanceof HTMLVideoElement) {
      video.style.width = "100%";
      video.style.height = "100%";
      (video as HTMLVideoElement).style.objectFit = "cover";
    }
    if (canvas instanceof HTMLCanvasElement) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.objectFit = "cover" as any;
    }
  };

  const startScanner = async (sessionId: number) => {
    if (stoppingRef.current) return;

    if (html5QrcodeRef.current) {
      if (isScannerRunning) {
        return;
      }

      await stopScanner();
    }

    let html5qrcode: Html5Qrcode | null = null;
    try {
      html5qrcode = new Html5Qrcode("qr-scanner");
      html5QrcodeRef.current = html5qrcode;
      const scannerInstance = html5qrcode;

      const onScan = (decodedText: string) => {
        const trimmed = decodedText.trim();
        const now = Date.now();
        if (lastScannedRef.current && lastScannedRef.current.code === trimmed && now - lastScannedRef.current.time < 1000) return;
        lastScannedRef.current = { code: trimmed, time: now };
        onBarcodeScannedRef.current(trimmed);
      };

      const qrbox = computeQrboxSize();

      // ensure container is mounted and connected before starting
      let container = containerRef.current || document.getElementById("qr-scanner");
      let attempts = 0;
      while ((!container || !container.isConnected) && attempts < 5) {
        // wait a bit for the element to be mounted
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 70));
        container = containerRef.current || document.getElementById("qr-scanner");
        attempts += 1;
      }

      if (!container || !container.isConnected) {
        setError("Klarte ikke finne skanner-beholderen i DOM");
        return;
      }

      const aspectRatio = (container as HTMLElement).clientWidth / Math.max(1, (container as HTMLElement).clientHeight);

      const startAttempt = async () => {
        try {
          await scannerInstance.start(
            { facingMode: "environment" },
            { fps: 10, qrbox, aspectRatio },
            onScan,
            () => {
              // ignore per-frame errors
            }
          );
          return true;
        } catch (err: any) {
          const msg = err && err.message ? String(err.message) : "";
          if (msg.includes("play() request was interrupted") || msg.includes("The play() request was interrupted")) {
            console.warn("play() interrupted during scanner start, will retry once", err);
            return false;
          }
          console.error("Error starting scanner:", err);
          throw err;
        }
      };

      let started = await startAttempt();
      if (!started) {
        // retry once after a tiny delay
        await new Promise((r) => setTimeout(r, 120));
        started = await startAttempt();
      }

      if (!started) {
        throw new Error("Scanneren klarte ikke å starte kameraet");
      }

      if (sessionId !== scannerSessionRef.current) {
        try { await scannerInstance.stop(); } catch { }
        try { await scannerInstance.clear(); } catch { }
        if (html5QrcodeRef.current === scannerInstance) {
          html5QrcodeRef.current = null;
        }
        return;
      }

      // Force styling so the video/canvas fill the rounded container
      applyVideoStyles();

      setIsScannerRunning(true);
      setError("");
    } catch (err) {
      console.error("Error starting scanner:", err);
      if (html5qrcode && html5QrcodeRef.current === html5qrcode) {
        html5QrcodeRef.current = null;
      }
      setError("Kunne ikke starte kamera. Sjekk tillatelser.");
      setIsScannerRunning(false);
    }
  };

  const stopScanner = async () => {
    // prevent re-entrant stops
    if (stoppingRef.current) return false;
    stoppingRef.current = true;

    const scanner = html5QrcodeRef.current;
    html5QrcodeRef.current = null;
    setIsScannerRunning(false);

    // Pause video and stop tracks up-front to reduce play()/remove races
    try {
      const root = document.getElementById("qr-scanner");
      const video = root?.querySelector("video") as HTMLVideoElement | null;
      if (video) {
        // silence abort/error events coming from the underlying camera implementation
        try { (video as any).onabort = () => { }; } catch { }
        try { (video as any).onerror = () => { }; } catch { }
        try { video.pause(); } catch { }
        try {
          const stream = video.srcObject as MediaStream | null;
          if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch { } });
          try { video.srcObject = null; } catch { }
        } catch (e) { }
      }
    } catch (e) { }

    const attemptStop = async () => {
      if (!scanner) return true; // nothing to stop

      try {
        // Temporarily override Node.removeChild to swallow NotFoundError during
        // html5-qrcode cleanup (race where a node is removed twice).
        const origRemoveChild = (Node.prototype as any).removeChild;
        (Node.prototype as any).removeChild = function (child: Node) {
          try {
            return origRemoveChild.call(this, child);
          } catch (err: any) {
            const name = err && (err.name || "");
            const msg = String(err || "");
            if (name === "NotFoundError" || msg.toLowerCase().includes("removechild") || msg.toLowerCase().includes("not a child")) {
              console.warn("Ignored NotFoundError during removeChild while stopping scanner:", msg);
              return child;
            }
            throw err;
          }
        };

        try {
          await scanner.stop();
        } finally {
          // restore the original implementation regardless of stop() outcome
          try { (Node.prototype as any).removeChild = origRemoveChild; } catch (e) { }
        }

        try { await scanner.clear(); } catch (err) { console.warn("Ignored error while clearing scanner:", err); }
        return true;
      } catch (err: any) {
        // html5-qrcode sometimes throws strings instead of Error objects; normalize
        const raw = err && (err.message || (err.toString && err.toString()) || String(err)) ? (err.message || err.toString()) : String(err);
        const msg = String(raw || "");
        const lower = msg.toLowerCase();

        // Treat known benign messages as successful stop (case-insensitive)
        if (
          lower.includes("removechild") ||
          lower.includes("not a child") ||
          lower.includes("play() request was interrupted") ||
          lower.includes("cannot stop") ||
          lower.includes("is not running") ||
          lower.includes("is not running or paused")
        ) {
          console.warn("Ignored transient scanner stop error:", msg);
          try { await scanner.clear(); } catch (e) { /* ignore */ }
          return true;
        }

        // Log unexpected stop errors but don't throw to UI
        console.error("Error stopping scanner:", err);
        return false;
      }
    };

    let stopped = await attemptStop();
    if (!stopped) {
      // short delay and retry once
      await new Promise((r) => setTimeout(r, 200));
      stopped = await attemptStop();
    }

    // defensive cleanup: ensure media tracks are stopped
    try {
      const root = document.getElementById("qr-scanner");
      const video = root?.querySelector("video") as HTMLVideoElement | null;
      if (video) {
        try { (video as any).onabort = () => { }; } catch { }
        try { (video as any).onerror = () => { }; } catch { }
        try { video.pause(); } catch { }
        try {
          const stream = video.srcObject as MediaStream | null;
          if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch { } });
          try { video.srcObject = null; } catch { }
        } catch (e) { }
      }
    } catch (e) { }

    stoppingRef.current = false;
    return stopped;
  };

  useEffect(() => {
    let resizeTimer: number | null = null;
    const sessionId = scannerSessionRef.current + 1;
    scannerSessionRef.current = sessionId;

    // Global runtime error suppression for specific benign scanner errors
    const onWindowError = (ev: ErrorEvent) => {
      const msg = ev && (ev.message || "");
      if (msg.includes("removeChild") || msg.includes("not a child") || msg.includes("The play() request was interrupted") || msg.includes("play() request was interrupted")) {
        console.warn("Suppressed runtime error (scanner related):", msg);
        ev.preventDefault();
      }
    };

    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      const reason = ev && (ev.reason && (ev.reason.message || String(ev.reason))) || "";
      if (reason.includes("The play() request was interrupted") || reason.includes("removeChild") || reason.includes("not a child")) {
        console.warn("Suppressed unhandled rejection (scanner related):", reason);
        ev.preventDefault();
      }
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection as EventListener);

    if (scannerActive) {
      void startScanner(sessionId);

      const onResize = () => {
        if (!html5QrcodeRef.current) return;
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(async () => {
          scannerSessionRef.current += 1;
          const restartSessionId = scannerSessionRef.current;
          await stopScanner();
          await startScanner(restartSessionId);
        }, 300) as unknown as number;
      };

      window.addEventListener("resize", onResize);

      return () => {
        scannerSessionRef.current += 1;
        window.removeEventListener("resize", onResize);
        if (resizeTimer) window.clearTimeout(resizeTimer);
        void stopScanner();
        window.removeEventListener('error', onWindowError);
        window.removeEventListener('unhandledrejection', onUnhandledRejection as EventListener);
      };
    } else {
      scannerSessionRef.current += 1;
      void stopScanner();
      return () => {
        window.removeEventListener('error', onWindowError);
        window.removeEventListener('unhandledrejection', onUnhandledRejection as EventListener);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive]);

  // Temporarily override Node.removeChild to swallow NotFoundError (race
  // where nodes are removed by underlying library and then by React).
  const temporarilySwallowRemoveChild = (duration = 500) => {
    try {
      const orig = (Node.prototype as any).removeChild;
      (Node.prototype as any).removeChild = function (child: Node) {
        try {
          return orig.call(this, child);
        } catch (err: any) {
          const msg = String(err || "").toLowerCase();
          if (msg.includes("removechild") || msg.includes("not a child") || (err && (err.name === "NotFoundError"))) {
            // swallow this known benign race
            console.warn("Swallowed NotFoundError from removeChild during camera hide:", msg);
            return child;
          }
          throw err;
        }
      };

      // restore after duration
      setTimeout(() => {
        try { (Node.prototype as any).removeChild = orig; } catch (e) { /* ignore */ }
      }, duration);
    } catch (e) {
      // ignore if we cannot override
    }
  };

  const hideCamera = async () => {
    // Stop the scanner while the DOM container is still present to avoid
    // html5-qrcode removing nodes from a container that has already been hidden.
    try {
      await stopScanner();
    } catch (err) {
      console.warn("hideCamera: stopScanner failed:", err);
    }

    // small grace period to let internal cleanup finish
    await new Promise((r) => setTimeout(r, 120));

    // Temporarily swallow removeChild errors while React commits the removal
    temporarilySwallowRemoveChild(500);

    // Now hide the UI and show manual registration
    setScannerActive(false);
    setShowManualEntry(true);
  };

  const handlePowerClick = async () => {
    if (scannerActive) {
      await hideCamera();
    } else {
      // turn camera on
      setShowManualEntry(false);
      setScannerActive(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Skann strekkode</h2>
      </div>

      {scannerActive ? (
        <div ref={containerRef} id="qr-scanner" className="w-full h-96 bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center">
          {isScannerRunning ? <span className="text-gray-200">Skanner kjører...</span> : <span className="text-gray-300">Kamera ikke aktivt</span>}

          {/* Centered scan frame overlay */}
          <div className="scan-frame pointer-events-none">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
          </div>
        </div>
      ) : (
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">Kamera skjult</div>
      )}

      <div className="mt-4 space-y-3">
        <button onClick={handlePowerClick} className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg">{scannerActive ? 'Skjul kamera' : 'Skru på kamera'}</button>
        <button onClick={() => setShowManualEntry(!showManualEntry)} className={`w-full px-4 py-3 ${showManualEntry ? 'bg-violet-700' : 'bg-violet-600'} hover:bg-violet-700 text-white rounded-lg`}>{showManualEntry ? 'Skjul registrering' : 'Manuell registrering'}</button>
      </div>

      <style jsx>{`
        #qr-scanner video, #qr-scanner canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          transform: scale(0.92) !important; /* zoom out slightly */
          transform-origin: center center !important;
        }

        /* Ensure the internal root uses full height */
        #qr-scanner .html5-qrcode, #qr-scanner .html5-qrcode-element {
          height: 100% !important;
        }

        /* Scanning frame */
        .scan-frame {
          position: absolute;
          width: 60%;
          aspect-ratio: 1 / 1;
          display: block;
        }

        .scan-frame .corner {
          position: absolute;
          width: 40px;
          height: 40px;
        }

        .scan-frame .corner.tl { left: 0; top: 0; border-top: 4px solid white; border-left: 4px solid white; }
        .scan-frame .corner.tr { right: 0; top: 0; border-top: 4px solid white; border-right: 4px solid white; }
        .scan-frame .corner.bl { left: 0; bottom: 0; border-bottom: 4px solid white; border-left: 4px solid white; }
        .scan-frame .corner.br { right: 0; bottom: 0; border-bottom: 4px solid white; border-right: 4px solid white; }
      `}</style>
    </div>
  );
}
