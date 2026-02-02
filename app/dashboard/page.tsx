"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("employeeId");
    if (id) {
      setEmployeeId(id);
    }
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employeeId");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            TESS Digitalt Varemottak
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Ansatt: <span className="font-medium">{employeeId}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
            >
              Logg ut
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Velkommen til Varemottaket
            </h2>
            <p className="text-lg text-gray-600">
              Velg en handling for å komme i gang
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goods Receipt Card */}
            <Link
              href="/goods-receipt"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
            >
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Varemottak
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Registrer og mottak nye varer. Verifiser innhold og dokumenter hele prosessen.
                  </p>
                </div>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Start mottak
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Track Parcel Card */}
            <Link
              href="/track-parcel"
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
            >
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0019 19a9 9 0 01-19-9 9.003 9.003 0 0118.354-6.354"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Spor Pakke
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Søk etter og spor status på forsendelser i systemet. Se detaljer og oppdateringer.
                  </p>
                </div>
                <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  Sporingsverktøy
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1h2v2H7V4zm2 4H7v2h2V8zm2-4h2v2h-2V4zm2 4h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Hjelp</h4>
                <p className="text-sm text-gray-600">
                  Hvis du har spørsmål eller trenger assistanse, kontakt IT-support eller din leder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
