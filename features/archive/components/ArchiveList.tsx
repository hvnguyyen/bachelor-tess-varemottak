"use client";

import ArchiveCard from "./ArchiveCard";

type ArchiveEntry = any;

type Props = { entries: ArchiveEntry[] };

export default function ArchiveList({ entries }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Arkiverte forsendelser ({entries.length})</h2>
      {entries.map((entry) => (
        <ArchiveCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
