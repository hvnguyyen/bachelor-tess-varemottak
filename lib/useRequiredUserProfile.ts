"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserProfile, UserProfile } from "@/lib/userProfile";

type RequiredProfileState = {
  profile: UserProfile | null;
  isReady: boolean;
};

export function useRequiredUserProfile(): RequiredProfileState {
  const router = useRouter();
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

  return { profile, isReady };
}
