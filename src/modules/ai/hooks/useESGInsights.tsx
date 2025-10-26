"use client";

import { useQuery } from "@tanstack/react-query";
import { getESGInsightsAdapter } from "../adapters/getESGInsights";
import { ESGScore } from "@/modules/esg/hooks/useESG";

export function useESGInsights(esgData: ESGScore[], enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["esgInsights", esgData?.length], // Use length instead of full array
    queryFn: () => getESGInsightsAdapter(esgData),
    enabled: enabled && esgData.length > 0,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });

  return {
    insights: data?.status === "success" && data.data ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
