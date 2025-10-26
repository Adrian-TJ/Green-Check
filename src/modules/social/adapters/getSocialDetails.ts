"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { Social } from "../models/Social";
import { getSocialDetailsService } from "../services/getSocialDetails";

export async function getSocialDetailsAdapter(
  pymeId: string
): Promise<GeneralResponse<Social[]>> {
  try {
    return await getSocialDetailsService(pymeId);
  } catch (error) {
    console.error("Error in getSocialDetailsAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching social details",
    };
  }
}
