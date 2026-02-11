"use client";

type Props = {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterStatus: "all" | "active" | string;
  setFilterStatus: (s: "all" | "active" | string) => void;
  filteredCount: number;
};

export default function SearchFilter({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredCount }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">{filteredCount} pakke(r) funnet</p>
      </div>
    </div>
  );
}
