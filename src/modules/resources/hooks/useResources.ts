"use client";

import { useQuery } from "@tanstack/react-query";
import { getResourcesAdapter } from "../adapters/getResources";
import { useUserSession } from "@/contexts/userSessionContext";

export function useResources() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  console.log("[useResources] User:", user);
  console.log("[useResources] PymeId:", pymeId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources", pymeId],
    queryFn: () => {
      if (!pymeId) {
        console.error("[useResources] No pyme ID found");
        throw new Error("No pyme ID found");
      }
      console.log("[useResources] Fetching resources for pymeId:", pymeId);
      return getResourcesAdapter(pymeId);
    },
    enabled: !!pymeId,
  });

  console.log("[useResources] Query result - data:", data, "isLoading:", isLoading, "error:", error);

  return {
    resources: data?.status === "success" ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
