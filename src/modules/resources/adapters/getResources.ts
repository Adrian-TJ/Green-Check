"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { ResourcesByType } from "../models/Resource";
import { getResourcesService } from "../services/getResources";

export async function getResourcesAdapter(
  pymeId: string
): Promise<GeneralResponse<ResourcesByType>> {
  try {
    return await getResourcesService(pymeId);
  } catch (error) {
    console.error("Error in getResourcesAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while fetching resources",
    };
  }
}
