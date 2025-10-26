"use server";

import { db } from "@/utils/db";
import type { GeneralResponse } from "@/models/generalResponse";
import type { GovernanceScore, GovernanceDocument } from "../models/Governance";

export async function getLatestGovernanceService(
  pymeId: string
): Promise<GeneralResponse<GovernanceDocument | null>> {
  try {
    const governance = await db.governance.findMany({
      where: { pymeId },
      orderBy: { created_at: "desc" },
    });

    return {
      status: "success",
      message: "Governance documents retrieved successfully",
      data: governance,
    };
  } catch (error) {
    console.error("Error retrieving governance documents:", error);
    return {
      status: "error",
      message: "Failed to retrieve governance documents",
    };
  }
}

export async function getGovernanceService(
  pymeId: string
): Promise<GeneralResponse<GovernanceScore[]>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    const governanceData = await db.governance.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!governanceData || governanceData.length === 0) {
      return {
        status: "error",
        message: "No governance data found for this pyme",
      };
    }

    // Governance impact weights (based on corporate governance best practices)
    // Total = 100% for normalization
    const weights = {
      ethics: 0.5, // 50% - Code of ethics (foundational governance)
      antiCorruption: 0.5, // 50% - Anti-corruption policy (risk management)
    };

    // Find when each policy was first adopted
    let ethicsAdoptedIndex = -1;
    let antiCorruptionAdoptedIndex = -1;

    governanceData.forEach((entry, idx) => {
      // Check if policy exists (non-null)
      if (entry.codigo_etica_url && ethicsAdoptedIndex === -1) {
        ethicsAdoptedIndex = idx;
      }
      if (entry.anti_corrupcion_url && antiCorruptionAdoptedIndex === -1) {
        antiCorruptionAdoptedIndex = idx;
      }
    });

    // Calculate governance score for each entry with maturity assessment
    const scores = governanceData.map((entry, index) => {
      // 1. ETHICS SCORE (0-100) - Code of ethics implementation
      let ethicsScore = 0;
      if (entry.codigo_etica_url) {
        // Base score for having policy (60 pts)
        ethicsScore = 60;

        // Maturity bonus (40 pts) - increases over time since adoption
        // +10 pts per period after adoption, max 40 pts
        const periodsSinceAdoption = index - ethicsAdoptedIndex;
        const maturityBonus = Math.min(periodsSinceAdoption * 10, 40);
        ethicsScore += maturityBonus;
      }

      // 2. ANTI-CORRUPTION SCORE (0-100) - Anti-corruption policy
      let antiCorruptionScore = 0;
      if (entry.anti_corrupcion_url) {
        // Base score for having policy (60 pts)
        antiCorruptionScore = 60;

        // Maturity bonus (40 pts)
        const periodsSinceAdoption = index - antiCorruptionAdoptedIndex;
        const maturityBonus = Math.min(periodsSinceAdoption * 10, 40);
        antiCorruptionScore += maturityBonus;
      }

      // Calculate weighted total score
      const weightedScore =
        ethicsScore * weights.ethics +
        antiCorruptionScore * weights.antiCorruption;

      return {
        date: entry.date.toISOString().split("T")[0],
        score: Math.round(Math.min(Math.max(weightedScore, 0), 100)), // 0-100
      };
    });

    return {
      status: "success",
      message: "Governance data fetched successfully",
      data: scores,
    };
  } catch (error) {
    console.error("Error fetching governance data:", error);
    return {
      status: "error",
      message: "An error occurred while fetching governance data",
    };
  }
}
