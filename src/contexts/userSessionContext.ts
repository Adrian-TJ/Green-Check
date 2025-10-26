"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserWithPyme } from "@/modules/auth/models/User";

interface UserSessionState {
  user: UserWithPyme | null;
  isAuthenticated: boolean;
  setUser: (user: UserWithPyme | null) => void;
  clearSession: () => void;
}

export const useUserSession = create<UserSessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      clearSession: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-session-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
