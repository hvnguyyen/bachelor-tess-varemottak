"use client";

type Props = {
  verificationCode: string;
  setVerificationCode: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  email: string;
  onBack: () => void;
  success: string;
  error: string;
};

export default function VerifyCodeForm({ verificationCode, setVerificationCode, onSubmit, isLoading, email, onBack, success, error }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <p className="text-gray-700 text-sm">En verifiseringskode har blitt sendt til mobilnummeret {email}. Skriv den inn nedenfor.</p>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">Verifiseringskode</label>
        <input id="code" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.toUpperCase())} placeholder="Skriv inn koden (f.eks. ABC123)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center tracking-widest" disabled={isLoading} maxLength={6} />
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200">{isLoading ? "Verifiserer..." : "Bekreft kode"}</button>

      <button type="button" onClick={onBack} className="w-full text-blue-600 hover:text-blue-700 font-medium py-2">Tilbake</button>
    </form>
  );
}
