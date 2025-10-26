"use client";

import { useQuery } from "@tanstack/react-query";
import { getGovernanceAdapter } from "../adapters/getGovernance";
import { useUserSession } from "@/contexts/userSessionContext";

export function useGovernance() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["governance", pymeId],
    queryFn: () => {
      if (!pymeId) {
        throw new Error("No pyme ID found");
      }
      return getGovernanceAdapter(pymeId);
    },
    enabled: !!pymeId,
  });

  return {
    governanceScores: data?.status === "success" ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
