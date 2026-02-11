"use client";

type Props = {
  employeeId: string;
  email: string;
  setEmployeeId: (s: string) => void;
  setEmail: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export default function RequestResetForm({ employeeId, email, setEmployeeId, setEmail, onSubmit, isLoading }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
          <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">Ansatt-ID</label>
        <input id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="f.eks. A123" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Mobil nr</label>
        <input id="email" type="tel" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="f.eks. +47 412 34 567" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200">{isLoading ? 'Sender...' : 'Send verifiseringskode'}</button>
    </form>
  );
}
