"use client";

import { useQuery } from "@tanstack/react-query";
import { getSocialAdapter } from "../adapters/getSocial";
import { useUserSession } from "@/contexts/userSessionContext";

export function useSocial() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["social", pymeId],
    queryFn: () => {
      if (!pymeId) {
        throw new Error("No pyme ID found");
      }
      return getSocialAdapter(pymeId);
    },
    enabled: !!pymeId,
  });

  return {
    socialScores: data?.status === "success" ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
