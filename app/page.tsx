"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API svarte med status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setApiData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feil ved henting av API:", err);
        setLoading(false);
        // Valgfritt: sett en error state her hvis du vil vise feilmelding i UI
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        TESS Digitalt Varemottak – POC
      </h1>

      {loading ? (
        <p className="text-lg">Laster fra API...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}