"use client";

import { Parcel } from "@/lib/parcelData";

type Props = {
  parcel: Parcel;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
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

export default function ParcelCard({ parcel, isExpanded, onToggleExpand }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button onClick={() => onToggleExpand(parcel.id)} className="w-full p-6 hover:bg-gray-50 transition text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-800">{parcel.referenceNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${parcel.status === 'delivered' ? 'bg-green-600' : parcel.status === 'in_transit' ? 'bg-blue-600' : 'bg-amber-600'}`}>{getStatusLabel(parcel.status)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Fra: <span className="font-medium">{parcel.sender}</span></p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>📍 {parcel.location}</span>
              <span>Ankomstdato: <span className="font-medium">{new Date(parcel.arrivalDate).toLocaleDateString("no-NO")}</span></span>
              <span>Sist oppdatert: {parcel.lastUpdate}</span>
            </div>
          </div>

          <svg className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </div>
      </button>

      {isExpanded && parcel.packages.length > 1 && (
        <div className="border-t bg-gray-50 p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Pakker ({parcel.packages.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {parcel.packages.map((pkg) => (
              <div key={pkg.id} className={`p-3 rounded-lg border border-gray-200 bg-white text-sm`}>
                <p className="font-medium text-gray-800 truncate">{pkg.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{pkg.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${pkg.status === 'delivered' ? 'bg-green-600 text-white' : pkg.status === 'in_transit' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}`}>{pkg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
