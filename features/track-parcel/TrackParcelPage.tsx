"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockParcels, Parcel, Package } from "@/lib/parcelData";
import SearchFilter from "./components/SearchFilter";
import ParcelCard from "./components/ParcelCard";

export default function TrackParcelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | Parcel["status"]>("active");
  const [expandedParcelId, setExpandedParcelId] = useState<string | null>(null);

  const filteredParcels = useMemo(() => {
    return mockParcels.filter((parcel) => {
      const matchesSearch =
        parcel.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parcel.sender.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = parcel.status !== "delivered";
      } else if (filterStatus !== "all") {
        matchesStatus = parcel.status === filterStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sporingsverktøy</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Tilbake</Link>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filteredCount={filteredParcels.length}
        />

        <div className="mt-6">
        {filteredParcels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Ingen pakker funnet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredParcels.map((parcel) => {
              const isExpanded = expandedParcelId === parcel.id;
              return (
                <ParcelCard key={parcel.id} parcel={parcel} isExpanded={!!isExpanded} onToggleExpand={(id) => setExpandedParcelId(isExpanded ? null : id)} />
              );
            })}
          </div>
        )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1h2v2H7V4zm2 4H7v2h2V8zm2-4h2v2h-2V4zm2 4h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Hjelp</h4>
              <p className="text-sm text-gray-600">Klikk på en pakke for å se detaljer om individuelle pakker og deres leveringsstatus. Plasseringen viser lagerplasseringen for enkel håndtering.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
