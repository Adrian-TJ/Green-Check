"use server";

import { db } from "@/utils/db";
import type { GeneralResponse } from "@/models/generalResponse";
import type { SocialScore } from "../models/Social";

export async function getSocialService(
  pymeId: string
): Promise<GeneralResponse<SocialScore[]>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    const socialData = await db.social.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!socialData || socialData.length === 0) {
      return {
        status: "error",
        message: "No social data found for this pyme",
      };
    }

    // Social impact weights (based on SDG alignment and social responsibility)
    // Total = 100% for normalization
    const weights = {
      equity: 0.30,        // 30% - Gender equity & inclusion (SDG 5, 10)
      development: 0.25,   // 25% - Training & skills development (SDG 4, 8)
      wellbeing: 0.25,     // 25% - Employee satisfaction & wellbeing (SDG 3, 8)
      protection: 0.20,    // 20% - Social protection & community (SDG 1, 11)
    };

    // Calculate social score for each entry
    const scores = socialData.map((entry) => {
      const totalEmployees = entry.men + entry.women;
      const totalLeadership = entry.men_in_leadership + entry.women_in_leadership;

      // 1. EQUITY SCORE (0-100) - Gender balance in workforce and leadership
      let equityScore = 0;
      if (totalEmployees > 0) {
        // Workforce gender balance (50 pts) - closer to 50/50 is better
        const workforceRatio = Math.min(entry.women, entry.men) / Math.max(entry.women, entry.men);
        const workforceBalance = workforceRatio * 50; // 0-50 range

        // Leadership gender balance (50 pts)
        let leadershipBalance = 0;
        if (totalLeadership > 0) {
          const leadershipRatio = entry.women_in_leadership / totalLeadership;
          // Ideal is 40-60% women, score decreases as it moves away
          if (leadershipRatio >= 0.4 && leadershipRatio <= 0.6) {
            leadershipBalance = 50; // Perfect balance
          } else {
            const deviation = Math.abs(leadershipRatio - 0.5);
            leadershipBalance = Math.max(0, 50 - (deviation * 100));
          }
        }

        equityScore = workforceBalance + leadershipBalance;
      }

      // 2. DEVELOPMENT SCORE (0-100) - Training & skills
      // Normalized to 80 hours/year as good practice (ILO recommendation)
      const developmentScore = Math.min((entry.training_hours / 80) * 100, 100);

      // 3. WELLBEING SCORE (0-100) - Employee satisfaction
      // Direct conversion from satisfaction_rate (0-1 to 0-100)
      const wellbeingScore = entry.satisfaction_rate * 100;

      // 4. PROTECTION SCORE (0-100) - Social security and community engagement
      const totalWorkers = entry.insured_employees + entry.uninsured_employees;
      let protectionScore = 0;
      if (totalWorkers > 0) {
        // Insurance coverage (70 pts)
        const insuranceRatio = entry.insured_employees / totalWorkers;
        const insuranceScore = insuranceRatio * 70;

        // Community programs (30 pts)
        const communityScore = entry.community_programs ? 30 : 0;

        protectionScore = insuranceScore + communityScore;
      }

      // Calculate weighted total score
      const weightedScore =
        (equityScore * weights.equity) +
        (developmentScore * weights.development) +
        (wellbeingScore * weights.wellbeing) +
        (protectionScore * weights.protection);

      const finalScore = Math.round(Math.min(Math.max(weightedScore, 0), 100));

      return {
        date: entry.date.toISOString().split("T")[0],
        score: finalScore, // 0-100
      };
    });

    return {
      status: "success",
      message: "Social data fetched successfully",
      data: scores,
    };
  } catch (error) {
    console.error("Error fetching social data:", error);
    return {
      status: "error",
      message: "An error occurred while fetching social data",
    };
  }
}
