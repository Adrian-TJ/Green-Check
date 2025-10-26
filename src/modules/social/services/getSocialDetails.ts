"use server";

import { db } from "@/utils/db";
import type { GeneralResponse } from "@/models/generalResponse";
import type { Social } from "../models/Social";

export async function getSocialDetailsService(
  pymeId: string
): Promise<GeneralResponse<Social[]>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    const socialDataRaw = await db.social.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!socialDataRaw || socialDataRaw.length === 0) {
      return {
        status: "error",
        message: "No social data found for this pyme",
      };
    }

    // Filter out entries with null pymeId and map to Social type
    const socialData: Social[] = socialDataRaw
      .filter((item) => item.pymeId !== null)
      .map((item) => ({
        id: item.id,
        men: item.men,
        women: item.women,
        men_in_leadership: item.men_in_leadership,
        women_in_leadership: item.women_in_leadership,
        training_hours: item.training_hours,
        satisfaction_rate: item.satisfaction_rate,
        community_programs: item.community_programs,
        insured_employees: item.insured_employees,
        uninsured_employees: item.uninsured_employees,
        date: item.date,
        pymeId: item.pymeId as string,
      }));

    return {
      status: "success",
      message: "Social data fetched successfully",
      data: socialData,
    };
  } catch (error) {
    console.error("Error fetching social data:", error);
    return {
      status: "error",
      message: "An error occurred while fetching social data",
    };
  }
}
