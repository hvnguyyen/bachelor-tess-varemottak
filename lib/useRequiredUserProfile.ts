"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserProfile, UserProfile } from "@/lib/userProfile";

type RequiredProfileState = {
  profile: UserProfile | null;
  isReady: boolean;
};

export function useRequiredUserProfile(): RequiredProfileState {
  const router = useRouter();
  const isReady = typeof window !== "undefined";
  const profile = useMemo(() => {
    if (!isReady) {
      return null;
    }

    return getStoredUserProfile();
  }, [isReady]);

  useEffect(() => {
    if (isReady && !profile) {
      router.replace("/login");
    }
  }, [isReady, profile, router]);

  return { profile, isReady };
}
