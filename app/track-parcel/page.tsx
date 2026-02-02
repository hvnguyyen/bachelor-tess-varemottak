"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { mockParcels, Parcel, Package } from "@/lib/parcelData";

export default function TrackParcelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | Parcel["status"]
  >("active");
  const [expandedParcelId, setExpandedParcelId] = useState<string | null>(null);

  // Filter parcels based on search and status
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

  const getStatusColor = (
    status: Parcel["status"]
  ): "blue" | "amber" | "orange" | "green" => {
    switch (status) {
      case "in_transit":
        return "blue";
      case "not_started":
        return "amber";
      case "partial_delivery":
        return "orange";
      case "delivered":
        return "green";
      default:
        return "blue";
    }
  };

  const getStatusLabel = (status: Parcel["status"]): string => {
    switch (status) {
      case "in_transit":
        return "Under transport";
      case "not_started":
        return "Ikke startet";
      case "partial_delivery":
        return "Delvis levert";
      case "delivered":
        return "Levert";
      default:
        return status;
    }
  };

  const getPackageStatusColor = (
    status: Package["status"]
  ): "green" | "blue" | "gray" => {
    switch (status) {
      case "delivered":
        return "green";
      case "in_transit":
        return "blue";
      case "pending":
        return "gray";
      default:
        return "gray";
    }
  };

  const getPackageStatusLabel = (status: Package["status"]): string => {
    switch (status) {
      case "delivered":
        return "Levert";
      case "in_transit":
        return "Under transport";
      case "pending":
        return "Venter";
      default:
        return status;
    }
  };

  const getDeliveryProgress = (packages: Package[]): number => {
    const delivered = packages.filter((p) => p.status === "delivered").length;
    return Math.round((delivered / packages.length) * 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Spor Pakke</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Søk etter referanse eller avsender
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="f.eks. PKG-2026-001 eller Supplier A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer etter status
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | Parcel["status"]
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="active">Aktive pakker</option>
                <option value="all">Alle pakker</option>
                <option value="in_transit">Under transport</option>
                <option value="not_started">Ikke startet</option>
                <option value="partial_delivery">Delvis levert</option>
                <option value="delivered">Levert</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {filteredParcels.length} pakke(r) funnet
            </p>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m0 0v4"
                />
              </svg>
              Arkiv
            </Link>
          </div>
        </div>

        {/* Parcels List */}
        {filteredParcels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Ingen pakker funnet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredParcels.map((parcel) => {
              const isExpanded = expandedParcelId === parcel.id;
              const statusColor = getStatusColor(parcel.status);
              const deliveryProgress = getDeliveryProgress(parcel.packages);

              return (
                <div
                  key={parcel.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Main Parcel Card */}
                  <button
                    onClick={() =>
                      setExpandedParcelId(
                        isExpanded ? null : parcel.id
                      )
                    }
                    className="w-full p-6 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Reference and Sender */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {parcel.referenceNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-${statusColor}-600`}
                          >
                            {getStatusLabel(parcel.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Fra: <span className="font-medium">{parcel.sender}</span>
                        </p>

                        {/* Multiple packages progress bar */}
                        {parcel.packages.length > 1 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                Leveringsfremgang
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {deliveryProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${deliveryProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Location and Date */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>📍 {parcel.location}</span>
                          <span>
                            Ankomstdato:{" "}
                            <span className="font-medium">
                              {new Date(parcel.arrivalDate).toLocaleDateString(
                                "no-NO"
                              )}
                            </span>
                          </span>
                          <span>Sist oppdatert: {parcel.lastUpdate}</span>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Packages List */}
                  {isExpanded && parcel.packages.length > 1 && (
                    <div className="border-t bg-gray-50 p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        Pakker ({parcel.packages.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {parcel.packages.map((pkg) => {
                          const pkgColor = getPackageStatusColor(pkg.status);
                          return (
                            <div
                              key={pkg.id}
                              className={`p-3 rounded-lg border border-gray-200 bg-white text-sm`}
                            >
                              <p className="font-medium text-gray-800 truncate">
                                {pkg.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {pkg.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold text-white bg-${pkgColor}-600 whitespace-nowrap`}
                                >
                                  {getPackageStatusLabel(pkg.status)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
                Klikk på en pakke for å se detaljer om individuelle pakker og deres leveringsstatus.
                Plasseringen viser lagerplasseringen for enkel håndtering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
