"use server";

import { db } from "@/utils/db";
import type { GeneralResponse } from "@/models/generalResponse";

export interface EnvironmentScore {
  date: string;
  score: number;
}

export async function getEnvironmentScoreService(
  pymeId: string
): Promise<GeneralResponse<EnvironmentScore[]>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    const resources = await db.resources.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!resources || resources.length === 0) {
      return {
        status: "error",
        message: "No resources found for this pyme",
      };
    }

    // Group by date and calculate score
    const scoresByDate = new Map<string, { agua?: number; luz?: number; gas?: number; transporte?: number }>();

    resources.forEach((r) => {
      const dateKey = r.date.toISOString().split("T")[0];
      if (!scoresByDate.has(dateKey)) {
        scoresByDate.set(dateKey, {});
      }
      const dateData = scoresByDate.get(dateKey)!;

      if (r.type === "AGUA") dateData.agua = r.consumption;
      if (r.type === "LUZ") dateData.luz = r.consumption;
      if (r.type === "GAS") dateData.gas = r.consumption;
      if (r.type === "TRANSPORTE") dateData.transporte = r.consumption;
    });

    // Get baseline (first entry) for each resource
    const firstDate = Array.from(scoresByDate.keys())[0];
    const baseline = scoresByDate.get(firstDate)!;

    // Environmental impact weights (based on CO2 footprint)
    // Total = 100% for normalization
    const weights = {
      agua: 0.15,       // 15% - Low carbon impact
      luz: 0.35,        // 35% - High carbon (electricity grid)
      gas: 0.30,        // 30% - High carbon (natural gas)
      transporte: 0.20, // 20% - Medium-high carbon (gasoline)
    };

    // Calculate scores based on reduction compared to baseline
    const scores: EnvironmentScore[] = [];

    for (const [date, data] of scoresByDate) {
      let weightedScore = 0;
      let totalWeight = 0;

      // Water score (weighted 15%)
      if (data.agua !== undefined && baseline.agua) {
        const reduction = ((baseline.agua - data.agua) / baseline.agua) * 100;
        // Convert reduction percentage to 0-100 score
        // -100% (doubled consumption) = 0 pts, 0% (no change) = 50 pts, 100% (eliminated) = 100 pts
        const aguaScore = Math.min(Math.max(reduction + 50, 0), 100);
        weightedScore += aguaScore * weights.agua;
        totalWeight += weights.agua;
      }

      // Electricity score (weighted 35%)
      if (data.luz !== undefined && baseline.luz) {
        const reduction = ((baseline.luz - data.luz) / baseline.luz) * 100;
        const luzScore = Math.min(Math.max(reduction + 50, 0), 100);
        weightedScore += luzScore * weights.luz;
        totalWeight += weights.luz;
      }

      // Gas score (weighted 30%)
      if (data.gas !== undefined && baseline.gas) {
        const reduction = ((baseline.gas - data.gas) / baseline.gas) * 100;
        const gasScore = Math.min(Math.max(reduction + 50, 0), 100);
        weightedScore += gasScore * weights.gas;
        totalWeight += weights.gas;
      }

      // Transport score (weighted 20%)
      if (data.transporte !== undefined && baseline.transporte) {
        const reduction = ((baseline.transporte - data.transporte) / baseline.transporte) * 100;
        const transporteScore = Math.min(Math.max(reduction + 50, 0), 100);
        weightedScore += transporteScore * weights.transporte;
        totalWeight += weights.transporte;
      }

      // Normalize to 0-100 scale based on available resources
      // If all resources present: totalWeight = 1.0, direct score
      // If some missing: renormalize to 100
      const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0;

      scores.push({
        date,
        score: Math.round(Math.min(Math.max(normalizedScore, 0), 100)), // 0-100
      });
    }

    return {
      status: "success",
      message: "Environment scores calculated successfully",
      data: scores,
    };
  } catch (error) {
    console.error("Error calculating environment score:", error);
    return {
      status: "error",
      message: "An error occurred while calculating environment score",
    };
  }
}
