"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredUserProfile,
  USER_PROFILE_STORAGE_EVENT,
  USER_PROFILE_STORAGE_KEY,
  UserProfile,
} from "@/lib/userProfile";

type RequiredProfileState = {
  profile: UserProfile | null;
  isReady: boolean;
};

let cachedRawProfile: string | null | undefined;
let cachedProfile: UserProfile | null = null;

function getServerSnapshot(): UserProfile | null {
  return null;
}

function getClientSnapshot(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawProfile = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);

  if (rawProfile === cachedRawProfile) {
    return cachedProfile;
  }

  cachedRawProfile = rawProfile;
  cachedProfile = getStoredUserProfile();

  return cachedProfile;
}

function subscribeToProfileChanges(onStoreChange: () => void) {
  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (event.key && event.key !== USER_PROFILE_STORAGE_KEY) {
        return;
      }
    }

    cachedRawProfile = undefined;
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(USER_PROFILE_STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(USER_PROFILE_STORAGE_EVENT, handleChange);
  };
}

function subscribeToHydration() {
  return () => undefined;
}

export function useRequiredUserProfile(): RequiredProfileState {
  const router = useRouter();
  const profile = useSyncExternalStore(
    subscribeToProfileChanges,
    getClientSnapshot,
    getServerSnapshot,
  );
  const isReady = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (isReady && !profile) {
      router.replace("/login");
    }
  }, [isReady, profile, router]);

  return { profile, isReady };
}
