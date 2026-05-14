"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearStoredUserProfile,
  extractUserProfile,
  saveUserProfile,
} from "@/lib/userProfile";

export default function AuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Fullfører innlogging...");
  const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

  useEffect(() => {
    let cancelled = false;

    const finalizeAuth = async () => {
      try {
        if (!useMockApi && !externalApiBase) {
          throw new Error("Mangler NEXT_PUBLIC_API_BASE_URL i miljøvariabler");
        }

        const meResponse = useMockApi
          ? await fetch("/api/me", {
              cache: "no-store",
              credentials: "include",
            })
          : await fetch(`${externalApiBase}/user`, {
              cache: "no-store",
              credentials: "include",
            });

        if (!meResponse.ok) {
          throw new Error("Kunne ikke validere session");
        }

        const meData = await meResponse.json().catch(() => null);
        const profile = extractUserProfile(meData);

        if (!profile) {
          throw new Error("Ugyldig brukerdata fra ekstern API");
        }

        saveUserProfile(profile);

        if (!cancelled) {
          router.replace("/dashboard");
        }
      } catch {
        if (!cancelled) {
          clearStoredUserProfile();
          setMessage("Innlogging feilet. Sender deg tilbake til login...");
          setTimeout(() => router.replace("/login?error=auth_failed"), 1200);
        }
      }
    };

    void finalizeAuth();

    return () => {
      cancelled = true;
    };
  }, [externalApiBase, router, useMockApi]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Autentisering</h1>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </main>
  );
}
