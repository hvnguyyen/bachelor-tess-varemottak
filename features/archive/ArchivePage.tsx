"use client";

import { useState } from "react";
import ArchiveForm from "./components/ArchiveForm";
import ArchiveList from "./components/ArchiveList";

export default function ArchivePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [formData, setFormData] = useState({ referenceNumber: "", sender: "", packagesCount: "", totalWeight: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${Date.now()}`;
    setEntries((prev) => [{ id, ...formData }, ...prev]);
    setFormData({ referenceNumber: "", sender: "", packagesCount: "", totalWeight: "", notes: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Arkiv</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ArchiveForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
          </div>
          <div>
            <ArchiveList entries={entries} />
          </div>
        </div>
      </div>
    </main>
  );
}
