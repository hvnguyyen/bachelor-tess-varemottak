"use client";

import Link from "next/link";
import { Parcel } from "@/lib/parcelData";

type Props = {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterStatus: "all" | "active" | Parcel["status"];
  setFilterStatus: (s: "all" | "active" | Parcel["status"]) => void;
  filteredCount: number;
};

export default function SearchFilter({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredCount }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
    
      {/* Søk */}
      <div className="flex-1">
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

      {/* Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer etter status
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
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

    {/* Arkiv */}
    <div className="flex-shrink-0">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Søk i arkiv
      </label>
      <Link
        href="/archive"
        className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition whitespace-nowrap"
      >
        Arkiv
      </Link>
    </div>
  </div>

  {/* Footer-linje i kortet */}
  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
    <p className="text-sm text-gray-600">{filteredCount} pakke(r) funnet</p>
  </div>
</div>

  );
}


/*
   <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Søk etter referanse eller avsender</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="f.eks. PKG-2026-001 eller Supplier A" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer etter status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
            <option value="active">Aktive pakker</option>
            <option value="all">Alle pakker</option>
            <option value="in_transit">Under transport</option>
            <option value="not_started">Ikke startet</option>
            <option value="partial_delivery">Delvis levert</option>
            <option value="delivered">Levert</option>
          </select>
        </div>

        <div className="flex
          flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">Søk i arkiv</label>
          <Link href="/archive" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Arkiv</Link>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">{filteredCount} pakke(r) funnet</p>
      </div>
    </div>
 */