"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RequestResetForm from "./components/RequestResetForm";
import VerifyCodeForm from "./components/VerifyCodeForm";
import ResetPasswordForm from "./components/ResetPasswordForm";

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

      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Verifiseringskode har blitt generert.");
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

      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Passord har blitt oppdatert!");
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TESS Digitalt Varemottak</h1>
          <p className="text-gray-600">Tilbakestill passord</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {step === "email" && (
            <RequestResetForm employeeId={employeeId} email={email} setEmployeeId={setEmployeeId} setEmail={setEmail} onSubmit={handleRequestReset} isLoading={isLoading} />
          )}

          {step === "verify" && (
            <VerifyCodeForm verificationCode={verificationCode} setVerificationCode={setVerificationCode} onSubmit={handleVerifyCode} isLoading={isLoading} email={email} onBack={() => { setStep("email"); setError(""); setSuccess(""); setVerificationCode(""); }} success={success} error={error} />
          )}

          {step === "reset" && (
            <ResetPasswordForm
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              setNewPassword={setNewPassword}
              setConfirmPassword={setConfirmPassword}
              onSubmit={handleResetPassword}
              isLoading={isLoading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              error={error}
              success={success}
            />
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Tilbake til innlogging</Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">Trenger du hjelp? Kontakt IT-support.</p>
      </div>
    </main>
  );
}
