"use client";

import Link from "next/link";

type Props = {
  formData: any;
  setFormData: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ArchiveForm({ formData, setFormData, onSubmit }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Arkiver forsendelse</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referansenummer</label>
            <input type="text" required value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} placeholder="f.eks. PKG-2026-001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tess-green focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avsender</label>
            <input type="text" required value={formData.sender} onChange={(e) => setFormData({ ...formData, sender: e.target.value })} placeholder="f.eks. Supplier A" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tess-green focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Antall pakker</label>
            <input type="number" required value={formData.packagesCount} onChange={(e) => setFormData({ ...formData, packagesCount: e.target.value })} placeholder="f.eks. 10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tess-green focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total vekt (valgfritt)</label>
            <input type="text" value={formData.totalWeight} onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })} placeholder="f.eks. 150 kg" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tess-green focus:border-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Merknader</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Tilleggsinformasjon eller observasjoner..." rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tess-green focus:border-transparent outline-none resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-tess-green hover:bg-tess-green-dark text-white font-medium rounded-lg transition">Arkiver</button>
          <button type="button" onClick={() => setFormData({ referenceNumber: "", sender: "", packagesCount: "", totalWeight: "", notes: "" })} className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition">Nullstill</button>
          <Link href="/track-parcel" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition">Tilbake</Link>
        </div>
      </form>
    </div>
  );
}
