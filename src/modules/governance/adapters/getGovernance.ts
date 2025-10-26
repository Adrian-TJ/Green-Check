"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { GovernanceScore, GovernanceDocument } from "../models/Governance";
import { getGovernanceService, getLatestGovernanceService } from "../services/getGovernance";

export async function getLatestGovernanceAdapter(
  pymeId: string
): Promise<GeneralResponse<GovernanceDocument | null>> {
  try {
    return await getLatestGovernanceService(pymeId);
  } catch (error) {
    console.error("Error in getLatestGovernanceAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching governance documents",
    };
  }
}

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
