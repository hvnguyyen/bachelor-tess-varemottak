"use client";

import { useState } from "react";
import Link from "next/link";

interface ArchiveEntry {
  id: string;
  date: string;
  referenceNumber: string;
  sender: string;
  packagesCount: number;
  totalWeight?: string;
  notes: string;
  archivedBy: string;
  archivedDate: string;
}

const mockArchive: ArchiveEntry[] = [
  {
    id: "arch-001",
    date: "2026-01-28",
    referenceNumber: "PKG-2026-007",
    sender: "Supplier F",
    packagesCount: 3,
    totalWeight: "25 kg",
    notes: "Alle pakker levert og kontrollert",
    archivedBy: "EMP001",
    archivedDate: "2026-01-30",
  },
  {
    id: "arch-002",
    date: "2026-01-20",
    referenceNumber: "PKG-2026-008",
    sender: "Supplier B",
    packagesCount: 25,
    totalWeight: "150 kg",
    notes: "Leveranse fullstendig. 100% kontrollert",
    archivedBy: "EMP002",
    archivedDate: "2026-01-28",
  },
  {
    id: "arch-003",
    date: "2026-01-15",
    referenceNumber: "PKG-2026-009",
    sender: "Supplier A",
    packagesCount: 12,
    totalWeight: "87 kg",
    notes: "Alt oppfyller standarder",
    archivedBy: "EMP001",
    archivedDate: "2026-01-20",
  },
  {
    id: "arch-004",
    date: "2026-01-10",
    referenceNumber: "PKG-2026-010",
    sender: "Supplier C",
    packagesCount: 8,
    totalWeight: "56 kg",
    notes: "Pakke #5 hadde mindre skade - dokumentert",
    archivedBy: "EMP003",
    archivedDate: "2026-01-15",
  },
];

export default function ArchivePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    referenceNumber: "",
    sender: "",
    packagesCount: "",
    totalWeight: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send archive entry to backend
    console.log("Archive entry submitted:", formData);
    alert("Arkiveringsregistrering mottatt!");
    setFormData({
      referenceNumber: "",
      sender: "",
      packagesCount: "",
      totalWeight: "",
      notes: "",
    });
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Arkiv</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake
          </Link>
        </div>

        {/* Toggle Form Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          {showForm ? "Skjul registreringsskjema" : "Arkiver ny forsendelse"}
        </button>

        {/* Archive Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Arkiver forsendelse
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referansenummer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referenceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referenceNumber: e.target.value,
                      })
                    }
                    placeholder="f.eks. PKG-2026-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avsender
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sender}
                    onChange={(e) =>
                      setFormData({ ...formData, sender: e.target.value })
                    }
                    placeholder="f.eks. Supplier A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Antall pakker
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.packagesCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packagesCount: e.target.value,
                      })
                    }
                    placeholder="f.eks. 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total vekt (valgfritt)
                  </label>
                  <input
                    type="text"
                    value={formData.totalWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalWeight: e.target.value,
                      })
                    }
                    placeholder="f.eks. 150 kg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merknader
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Tilleggsinformasjon eller observasjoner..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  Arkiver
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Archive List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Arkiverte forsendelser ({mockArchive.length})
          </h2>

          {mockArchive.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Referansenummer
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {entry.referenceNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Avsender
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {entry.sender}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Pakker
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {entry.packagesCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Forsendelsesdato
                  </p>
                  <p className="text-sm text-gray-800">
                    {new Date(entry.date).toLocaleDateString("no-NO")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Vekt
                  </p>
                  <p className="text-sm text-gray-800">
                    {entry.totalWeight || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Arkivert av
                  </p>
                  <p className="text-sm text-gray-800">
                    {entry.archivedBy} (
                    {new Date(entry.archivedDate).toLocaleDateString("no-NO")})
                  </p>
                </div>
              </div>

              {entry.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Merknader
                  </p>
                  <p className="text-sm text-gray-700 italic">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                Arkivet inneholder alle fullstendig leverte forsendelser. Registrer nye arkiverte
                forsendelser ved å klikke på "Arkiver ny forsendelse".
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
