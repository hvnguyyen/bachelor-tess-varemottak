"use client";

type Props = {
  manualCode: string;
  setManualCode: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showManualEntry: boolean;
};

export default function ManualEntry({ manualCode, setManualCode, onSubmit, showManualEntry }: Props) {
  if (!showManualEntry) return null;

  return (
    <form onSubmit={onSubmit} className="mt-4 pt-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Skriv inn strekkode"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          autoFocus
        />
        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition">Legg til</button>
      </div>
    </form>
  );
}
