"use client";

type Props = { entry: any };

export default function ArchiveCard({ entry }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{entry.referenceNumber}</h3>
          <p className="text-sm text-gray-500">{entry.sender} • {entry.packagesCount} pakker</p>
        </div>
        <div className="text-sm text-gray-500">{entry.id}</div>
      </div>
    </div>
  );
}
