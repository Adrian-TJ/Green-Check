"use server";

import { PrismaClient } from "@prisma/client";
import type { GeneralResponse } from "@/models/generalResponse";
import type { ResourcesByType } from "../models/Resource";

const prisma = new PrismaClient();

export async function getResourcesService(
  pymeId: string
): Promise<GeneralResponse<ResourcesByType>> {
  try {
    if (!pymeId) {
      return {
        status: "error",
        message: "PymeId is required",
      };
    }

    // Fetch all resources for the pyme
    const resources = await prisma.resources.findMany({
      where: { pymeId },
      orderBy: { date: "asc" },
    });

    if (!resources || resources.length === 0) {
      return {
        status: "error",
        message: "No resources found for this pyme",
      };
    }

    // Group resources by type and format for charts
    const agua = resources
      .filter((r) => r.type === "AGUA")
      .map((r) => ({
        date: r.date.toISOString().split("T")[0],
        consumption: r.consumption,
      }));

    const luz = resources
      .filter((r) => r.type === "LUZ")
      .map((r) => ({
        date: r.date.toISOString().split("T")[0],
        consumption: r.consumption,
      }));

    const gas = resources
      .filter((r) => r.type === "GAS")
      .map((r) => ({
        date: r.date.toISOString().split("T")[0],
        consumption: r.consumption,
      }));

    const transporte = resources
      .filter((r) => r.type === "TRANSPORTE")
      .map((r) => ({
        date: r.date.toISOString().split("T")[0],
        consumption: r.consumption,
      }));

    return {
      status: "success",
      message: "Resources fetched successfully",
      data: { agua, luz, gas, transporte },
    };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return {
      status: "error",
      message: "An error occurred while fetching resources",
    };
  }
}
