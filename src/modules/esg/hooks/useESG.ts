"use client";

import { useMemo } from "react";
import { useSocial } from "@/modules/social/hooks/useSocial";
import { useGovernance } from "@/modules/governance/hooks/useGovernance";
import { useQuery } from "@tanstack/react-query";
import { useUserSession } from "@/contexts/userSessionContext";
import { getEnvironmentScoreService } from "@/modules/resources/services/getEnvironmentScore";

export interface ESGScore {
  date: string;
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  esgScore: number;
}

export function useESG() {
  const { user } = useUserSession();
  const pymeId = user?.pyme?.id;

  const { socialScores, isLoading: socialLoading } = useSocial();
  const { governanceScores, isLoading: governanceLoading } = useGovernance();

  const { data: envData, isLoading: envLoading } = useQuery({
    queryKey: ["environmentScore", pymeId],
    queryFn: () => {
      if (!pymeId) throw new Error("No pyme ID found");
      return getEnvironmentScoreService(pymeId);
    },
    enabled: !!pymeId,
  });

  const environmentScores = envData?.status === "success" && envData.data ? envData.data : [];

  // Combine all scores by date
  const esgScores = useMemo(() => {
    // Check if all arrays have data
    if (!environmentScores?.length || !socialScores?.length || !governanceScores?.length) {
      return [];
    }

    const scoresByDate = new Map<string, Partial<ESGScore>>();

    // Add environment scores
    environmentScores.forEach((env) => {
      scoresByDate.set(env.date, {
        date: env.date,
        environmentScore: env.score,
      });
    });

    // Add social scores
    socialScores.forEach((social) => {
      const existing = scoresByDate.get(social.date) || { date: social.date };
      scoresByDate.set(social.date, {
        ...existing,
        socialScore: social.score,
      });
    });

    // Add governance scores
    governanceScores.forEach((gov) => {
      const existing = scoresByDate.get(gov.date) || { date: gov.date };
      scoresByDate.set(gov.date, {
        ...existing,
        governanceScore: gov.score,
      });
    });

    // Calculate ESG score and filter complete entries
    const completeScores: ESGScore[] = [];

    for (const [date, scores] of scoresByDate) {
      if (
        scores.environmentScore !== undefined &&
        scores.socialScore !== undefined &&
        scores.governanceScore !== undefined
      ) {
        const esgScore = Math.round(
          (scores.environmentScore + scores.socialScore + scores.governanceScore) /
            3
        );

        completeScores.push({
          date,
          environmentScore: scores.environmentScore,
          socialScore: scores.socialScore,
          governanceScore: scores.governanceScore,
          esgScore,
        });
      }
    }

    return completeScores.sort((a, b) => a.date.localeCompare(b.date));
  }, [environmentScores, socialScores, governanceScores]);

  const isLoading = socialLoading || governanceLoading || envLoading;

  return {
    esgScores,
    environmentScores,
    socialScores,
    governanceScores,
    isLoading,
  };
}
