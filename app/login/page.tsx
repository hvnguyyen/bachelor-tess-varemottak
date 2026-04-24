import { Suspense } from "react";
import LoginPage from "@/features/auth/login/LoginPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
            Laster innlogging...
          </div>
        </main>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
