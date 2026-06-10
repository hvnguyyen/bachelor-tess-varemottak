"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearStoredUserProfile } from "@/lib/userProfile";
import { useRequiredUserProfile } from "@/lib/useRequiredUserProfile";

/**
 * Felles topp-header for alle innloggede sider.
 * Viser TESS-logo + applikasjonsnavn (lenker til /dashboard) og en profilmeny
 * med fornavnet til innlogget bruker pluss en "Logg ut"-handling.
 */
export default function AppHeader() {
  const router = useRouter();
  const { profile, isReady } = useRequiredUserProfile();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsProfileOpen(false);

    const externalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

    try {
      if (externalApiBase) {
        await fetch(`${externalApiBase}/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
      }

      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => undefined);
    } finally {
      clearStoredUserProfile();
      router.push("/");
    }
  };

  if (!isReady || !profile) {
    return null;
  }

  const fullName = profile.name || "TESS-bruker";
  const firstName = fullName.split(" ")[0] || fullName;
  const employeeId = profile.employeeId || "Ukjent ansatt-ID";

  return (
    <header className="sticky top-0 z-20 bg-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 text-2xl font-bold text-gray-800 transition hover:opacity-90"
        >
          <Image src="/tess-logo.svg" alt="TESS" width={156} height={32} className="h-8 w-auto" priority />
          <span>Varemottak</span>
        </Link>

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-tess-green"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span suppressHydrationWarning>{firstName}</span>
            <svg
              className={`h-4 w-4 transition ${isProfileOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isProfileOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-10 mt-2 min-w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
            >
              <div className="px-5 py-4">
                <p className="text-base font-semibold text-gray-900">{fullName}</p>
                <p className="mt-0.5 break-all text-sm text-gray-600" suppressHydrationWarning>
                  {employeeId}
                </p>
              </div>
              <div className="border-t border-gray-200" />
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                role="menuitem"
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{isLoggingOut ? "Logger ut..." : "Logg ut"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
