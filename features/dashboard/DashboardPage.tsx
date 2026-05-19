"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearStoredUserProfile } from "@/lib/userProfile";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";
import ActionCard from "./components/ActionCard";


export default function DashboardPage() {
  const router = useRouter();
  const { profile, isReady } = useRequiredUserProfile();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsProfileOpen(false);

    const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

    try {
      if (externalApiBase) {
        await fetch(`${externalApiBase}/logout`, {
          method: "POST",
          credentials: "include"
        }).catch(() => undefined);
      }

      await fetch("/api/auth/logout", {
        method: "POST"
      }).catch(() => undefined);

    } finally {
      clearStoredUserProfile();
      router.push("/");
    }
  };

  if (!isReady || !profile) {
    return null;
  }

  const employeeName = profile.name || "TESS-bruker";
  const employeeId = profile.employeeId || "Ukjent ansatt-ID";

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
            <Image src="/tess-logo.svg" alt="TESS" width={156} height={32} className="h-8 w-auto" priority />
            <span>Digitalt Varemottak</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span suppressHydrationWarning>
                Innlogget som ansatt: <span className="font-medium">{employeeName}</span>
              </span>
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  👤
                  <svg
                    className={`h-4 w-4 transition ${isProfileOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isProfileOpen ? (
                  <div className="absolute right-0 top-full z-10 mt-2 min-w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Ansatt-ID
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-gray-800" suppressHydrationWarning>
                      {employeeId}
                    </p>
                    <div className="my-3 border-t border-gray-200" />
                    <button
                      onClick={() => void handleLogout()} disabled={isLoggingOut}
                      className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      {isLoggingOut ? "Logger ut..." : "Logg ut"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Velkommen til Varemottaket</h2>
            <p className="text-lg text-gray-600">Velg en handling for å komme i gang</p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ActionCard href="/goods-receipt" title="Varemottak" description="Registrer og motta nye varer. Verifiser innhold og dokumenter prosessen." color="blue" cta="Start mottak" />
            <ActionCard href="/track-parcel" title="Sporing" description="Søk og spor status på forsendelser i systemet." color="green" cta="Sporingsverktøy" />
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1h2v2H7V4zm2 4H7v2h2V8zm2-4h2v2h-2V4zm2 4h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Hjelp</h4>
                <p className="text-sm text-gray-600">Hvis du har spørsmål eller trenger assistanse, kontakt IT-support eller din leder.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
