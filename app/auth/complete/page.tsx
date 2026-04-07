"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { extractUserProfile, saveUserProfile } from "@/lib/userProfile";

type UserLike = {
  name?: string;
  username?: string;
  email?: string;
  userName?: string;
};

function toProfileLabel(data: unknown) {

  const source = Array.isArray(data) ? data[0] : data;
  const meData = (source ?? null) as UserLike | null;

  return (
    meData?.name ||
    meData?.username ||
    meData?.email ||
    meData?.userName ||
    "TESS-bruker"
  );
}

export default function AuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Fullfører innlogging...");

  useEffect(() => {
    let cancelled = false;

    const finalizeAuth = async () => {
      try {
        const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

        if (externalApiBase) {

          const externalResponse = await fetch(`${externalApiBase}/user`, {
            cache: "no-store",
            credentials: "include",

          });

          if (externalResponse.ok) {

            const externalData = await externalResponse.json().catch(() => null);
            const profile = extractUserProfile(externalData);

            if (!profile) {
              throw new Error("Ugyldig brukerdata fra ekstern API");
            }

            saveUserProfile(profile);

            if (!cancelled) router.replace("/dashboard");
            return;
          }
        }

        // Fallback for mock flow.
        const meResponse = await fetch("/api/me", { cache: "no-store" });
        if (!meResponse.ok) throw new Error("Kunne ikke validere session");

        const meData = await meResponse.json().catch(() => null);
        const profile = extractUserProfile(meData);

        if (!profile) {
          throw new Error("Ugyldig brukerdata fra /api/me");
        }

        saveUserProfile(profile);

        if (!cancelled) router.replace("/dashboard");

      } catch {
        if (!cancelled) {
          setMessage("Innlogging feilet. Sender deg tilbake til login...");

          setTimeout(() => {
            router.replace("/login?error=auth_failed");
          }, 1200);
        }
      }
    };

    void finalizeAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">Autentisering</h1>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </main>
  );
}
