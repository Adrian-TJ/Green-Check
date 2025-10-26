"use client";

import { useQuery } from "@tanstack/react-query";
import { getSocialDetailsAdapter } from "../adapters/getSocialDetails";
import { useUserSession } from "@/contexts/userSessionContext";

export function useSocialDetails() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["socialDetails", pymeId],
    queryFn: () => {
      if (!pymeId) throw new Error("No pyme ID found");
      return getSocialDetailsAdapter(pymeId);
    },
    enabled: !!pymeId,
  });

  return {
    socialData: data?.status === "success" && data.data ? data.data : [],
    isLoading,
    error,
    refetch,
  };
}
