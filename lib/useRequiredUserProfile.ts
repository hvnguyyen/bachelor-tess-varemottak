"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useMemo } from "react";
>>>>>>> fase3-sporing
import { useRouter } from "next/navigation";
import { getStoredUserProfile, UserProfile } from "@/lib/userProfile";

type RequiredProfileState = {
  profile: UserProfile | null;
  isReady: boolean;
};

export function useRequiredUserProfile(): RequiredProfileState {
  const router = useRouter();
<<<<<<< HEAD
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedProfile = getStoredUserProfile();

    if (!storedProfile) {
      router.replace("/login");
      return;
    }

    setProfile(storedProfile);
    setIsReady(true);
  }, [router]);
=======
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
>>>>>>> fase3-sporing

  return { profile, isReady };
}
