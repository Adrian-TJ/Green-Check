"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { GovernanceScore } from "../models/Governance";
import { getGovernanceService } from "../services/getGovernance";

export async function getGovernanceAdapter(
  pymeId: string
): Promise<GeneralResponse<GovernanceScore[]>> {
  try {
    return await getGovernanceService(pymeId);
  } catch (error) {
    console.error("Error in getGovernanceAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching governance data",
    };
  }
}
