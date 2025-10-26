"use client";

import { GeneralResponse } from "@/models/generalResponse";
import { AIInsight } from "../models/AIInsight";
import { ESGScore } from "@/modules/esg/hooks/useESG";
import { getESGInsightsService } from "../services/getESGInsights";

export async function getESGInsightsAdapter(
  esgData: ESGScore[]
): Promise<GeneralResponse<AIInsight>> {
  try {
    return await getESGInsightsService(esgData);
  } catch (error) {
    console.error("Error in getESGInsightsAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching AI insights",
    };
  }
}
