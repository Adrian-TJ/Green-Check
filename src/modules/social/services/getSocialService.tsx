"use server";

import { PrismaClient } from "@prisma/client";
import type { GeneralResponse } from "@/models/generalResponse";
import type { SocialDataResponse } from "../models/Social";

const prisma = new PrismaClient();

export async function getSocialService(
  pymeId: string
): Promise<GeneralResponse<SocialDataResponse>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    const socials = await prisma.social.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!socials || socials.length === 0) {
      return {
        status: "error",
        message: "No social data found for this pyme",
      };
    }

    // Map to chart format
    const social = socials.map((s) => ({
      date: s.date.toISOString().split("T")[0],
      men: s.men,
      women: s.women,
      men_in_leadership: s.men_in_leadership,
      women_in_leadership: s.women_in_leadership,
      training_hours: s.training_hours,
      satisfaction_rate: s.satisfaction_rate,
      insured_employees: s.insured_employees,
      uninsured_employees: s.uninsured_employees,
    }));

    return {
      status: "success",
      message: "Social data fetched successfully",
      data: { social },
    };
  } catch (error) {
    console.error("Error fetching social data:", error);
    return {
      status: "error",
      message: "An error occurred while fetching social data",
    };
  }
}
