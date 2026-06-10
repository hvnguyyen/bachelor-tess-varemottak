"use client";

import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";
import AppHeader from "@/features/shared/components/AppHeader";
import ActionCard from "./components/ActionCard";


export default function DashboardPage() {
  const { profile, isReady } = useRequiredUserProfile();

  if (!isReady || !profile) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-tess-surface to-white">
      <AppHeader />

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
            <ActionCard href="/goods-receipt" title="Varemottak" description="Registrer og motta nye varer. Verifiser innhold og dokumenter prosessen." variant="primary" cta="Start mottak" />
            <ActionCard href="/track-parcel" title="Sporing" description="Søk og spor status på forsendelser i systemet." variant="dark" cta="Sporingsverktøy" />
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-tess-green-light border border-tess-green-soft rounded-lg p-6">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-tess-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
