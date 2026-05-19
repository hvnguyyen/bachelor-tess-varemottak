"use client";

import Link from "next/link";
import AppHeader from "@/features/shared/components/AppHeader";

export default function ArchivePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-tess-surface to-white">
      <AppHeader />
      <div className="max-w-4xl mx-auto p-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Arkiv</h1>
          <Link href="/track-parcel" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">
            Tilbake til Sporing
          </Link>
        </div>

        {/* Out of Scope Notice */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4">
            <svg className="w-12 h-12 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Funksjon under utvikling</h2>
              <p className="text-gray-600 mb-4">
                Arkivfunksjonen er planlagt for fremtidig implementering og er per nå utenfor prosjektets omfang.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Description */}
        <div className="bg-tess-green-light border border-tess-green-soft rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-tess-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Planlagt funksjonalitet
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Arkivet vil gi brukere mulighet til å:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>Se historikk over tidligere leverte forsendelser</li>
            <li>Søke i og filtrere gamle leveranser</li>
            <li>Eksportere data for rapportering</li>
            <li>Spore komplette leveranser over tid</li>
          </ul>
        </div>

        {/* Future Implementation Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Tekniske krav
          </h3>
          <p className="text-sm text-gray-600">
            Implementering av arkivfunksjonen vil kreve en database-løsning for permanent lagring av historiske data.<br />
            <br/>Dette vil være en mulig fremtidig utvidelse av systemet.
          </p>
        </div>

        {/* Dashboard Link */}
        <div className="text-center my-6">
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">
            Hjem til Dashbord
          </Link>
        </div>
      </div>
    </main>
  );
}
