"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { verifyUserAdapter } from "../adapters/verifyUser";
import { useUserSession } from "@/contexts/userSessionContext";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function useAuth() {
  const { setUser, clearSession, user, isAuthenticated } = useUserSession();

  const login = useMutation({
    mutationFn: verifyUserAdapter,
    onSuccess: (response) => {
      if (response.status === "success" && response.data) {
        setUser(response.data);
      }
    },
  });

  const logout = () => {
    clearSession();
  };

  return {
    login,
    logout,
    user,
    isAuthenticated,
    loginSchema,
  };
}
