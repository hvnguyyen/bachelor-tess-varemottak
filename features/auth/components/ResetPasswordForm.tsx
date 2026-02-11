"use client";

type Props = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (s: string) => void;
  setConfirmPassword: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (b: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (b: boolean) => void;
  error: string;
  success: string;
};

export default function ResetPasswordForm({ newPassword, confirmPassword, setNewPassword, setConfirmPassword, onSubmit, isLoading, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, error, success }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <p className="text-gray-700 text-sm">Opprett et nytt passord for din konto.</p>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Nytt passord</label>
        <div className="relative">
          <input id="newPassword" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Skriv inn nytt passord (minst 8 tegn)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" disabled={isLoading} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" disabled={isLoading}>{showPassword ? 'Vis' : 'Skjul'}</button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Minst 8 tegn</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Bekreft passord</label>
        <div className="relative">
          <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Skriv inn passord igjen" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" disabled={isLoading} />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" disabled={isLoading}>{showConfirmPassword ? 'Vis' : 'Skjul'}</button>
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200">{isLoading ? "Oppdaterer..." : "Oppdater passord"}</button>
    </form>
  );
}
