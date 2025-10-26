"use client";

import { useEffect } from "react";
import { useUserSession } from "@/contexts/userSessionContext";

export function HydrationZustand() {
  const { persist } = useUserSession as unknown as {
    persist: { rehydrate: () => void };
  };

  useEffect(() => {
    if (persist?.rehydrate) {
      persist.rehydrate();
    }
  }, [persist]);

  return null;
}
