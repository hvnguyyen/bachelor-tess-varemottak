"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!employeeId || !email) {
        setError("Vennligst fyll inn både ansatt-ID og e-post");
        setIsLoading(false);
        return;
      }

      // Simulate verification code generation
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Mock verification code: ${mockCode}`);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(
        `Verifiseringskode har blitt generert: ${mockCode} (Se konsollen)`
      );
      setStep("verify");
    } catch (err) {
      setError("Kunne ikke generere verifiseringskode. Prøv igjen senere.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!verificationCode) {
        setError("Vennligst skriv inn verifiseringskoden");
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Koden er bekreftet. Du kan nå opprette et nytt passord.");
      setStep("reset");
    } catch (err) {
      setError("Ugyldig verifiseringskode. Prøv igjen.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        setError("Vennligst fyll inn begge passord-feltene");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passordene stemmer ikke overens");
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setError("Passord må være minst 8 tegn langt");
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Passord har blitt oppdatert!");
      // Store employee ID and navigate to dashboard to bypass login
      localStorage.setItem("employeeId", employeeId);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError("Kunne ikke oppdatere passord. Prøv igjen senere.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            TESS Digitalt Varemottak
          </h1>
          <p className="text-gray-600">Tilbakestill passord</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {/* Step 1: Request Reset */}
          {step === "email" && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <p className="text-gray-700 text-sm mb-6">
                Skriv inn din ansatt-ID og e-post så sender vi deg en verifiseringskode.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="employeeId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ansatt-ID
                </label>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Skriv inn din ansatt-ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Skriv inn din e-post"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {isLoading ? "Sender..." : "Send verifiseringskode"}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <p className="text-gray-700 text-sm">
                En verifiseringskode har blitt sendt til {email}. Skriv den inn nedenfor.
              </p>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verifiseringskode
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Skriv inn koden (f.eks. ABC123)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center tracking-widest"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {isLoading ? "Verifiserer..." : "Bekreft kode"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setSuccess("");
                  setVerificationCode("");
                }}
                className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Tilbake
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <p className="text-gray-700 text-sm">
                Opprett et nytt passord for din konto.
              </p>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nytt passord
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Skriv inn nytt passord"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a8.973 8.973 0 015.542 1.882l-1.41 1.41A6.973 6.973 0 0010 5c-3.866 0-7.17 2.957-7.542 7a7.02 7.02 0 001.05 3.442l-1.414 1.414A8.98 8.98 0 0110 3zm0 14a8.973 8.973 0 01-5.542-1.882l1.41-1.41A6.973 6.973 0 0010 15c3.866 0 7.17-2.957 7.542 7a7.02 7.02 0 00-1.05-3.442l1.414-1.414A8.98 8.98 0 0110 17z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minst 8 tegn</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bekreft passord
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Skriv inn passord igjen"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a8.973 8.973 0 015.542 1.882l-1.41 1.41A6.973 6.973 0 0010 5c-3.866 0-7.17 2.957-7.542 7a7.02 7.02 0 001.05 3.442l-1.414 1.414A8.98 8.98 0 0110 3zm0 14a8.973 8.973 0 01-5.542-1.882l1.41-1.41A6.973 6.973 0 0010 15c3.866 0 7.17-2.957 7.542 7a7.02 7.02 0 00-1.05-3.442l1.414-1.414A8.98 8.98 0 0110 17z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {isLoading ? "Oppdaterer..." : "Oppdater passord"}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Tilbake til innlogging
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Trenger du hjelp? Kontakt IT-support.
        </p>
      </div>
    </main>
  );
}
