"use client";

import { useState } from "react";

type ExternalMode = "tenant" | "sso";

export default function LoginPage() {
  const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

  const [error, setError] = useState("");

  const handleExternalLogin = async (externalMode: ExternalMode) => {
    setError("");
    if (!externalApiBase) {
      setError("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
      return;
    }

    // Clear any existing session before starting a new external auth flow.
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);

    const base = externalApiBase.replace(/\/+$/, "");

    const returnTo = `${window.location.origin}/auth/complete`;
    const redirectUrl = `${base}/auth/${externalMode}?returnTo=${encodeURIComponent(returnTo)}`;

    window.location.href = redirectUrl;
  };

  const handleTtmLogin = () => {
    setError("");
    if (!useMockApi) {
      setError("TTM ID er kun tilgjengelig i dev med NEXT_PUBLIC_USE_MOCK_API=true");
      return;
    }
    // mock-auth sets the session cookie server-side and redirects directly to /auth/complete.
    window.location.href = "/api/mock-auth/tenant";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TESS Digitalt Varemottak</h1>
          <p className="text-gray-600">Logg inn via Entra ID for å fortsette</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">
              1. Velg innloggingstype (Tenant og SSO går til Microsoft Entra ID)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void handleExternalLogin("tenant")}
                className="px-4 py-3 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Logg inn som Tenant
              </button>
              <button
                type="button"
                onClick={() => void handleExternalLogin("sso")}
                className="px-4 py-3 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Logg inn med SSO
              </button>
            </div>
          </div>

          {useMockApi ? (
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                2. Logg inn med TTM ID (TTM ID er midlertidig mock for dev)
              </p>
              <button
                type="button"
                onClick={handleTtmLogin}
                className="w-full bg-gray-800 hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Logg inn med TTM ID
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Simulerer auth-kjede lokalt: authorize - callback - token exchange - session.
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 -mt-2">
              Etter vellykket ekstern innlogging blir du sendt videre når session er klar.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
