"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { SocialScore } from "../models/Social";
import { getSocialService } from "../services/getSocial";

export async function getSocialAdapter(
  pymeId: string
): Promise<GeneralResponse<SocialScore[]>> {
  try {
    return await getSocialService(pymeId);
  } catch (error) {
    console.error("Error in getSocialAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching social data",
    };
  }
}
