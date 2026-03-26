import Link from "next/link";

export default function TrackParcelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sporingsverktøy</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
          >
            Tilbake
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900">Sporing kommer i neste iterasjon</h2>
          <p className="mt-4 text-gray-600">
            Denne modulen er midlertidig satt på vent mens ordregrunnlaget vises inne i varemottaksflyten.
          </p>
        </div>
      </div>
    </main>
  );
}
