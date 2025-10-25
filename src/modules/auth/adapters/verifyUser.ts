"use client";

import type { GeneralResponse } from "@/models/generalResponse";
import type { UserWithPyme } from "../models/User";
import { verifyUserService } from "../services/verifyUser";

export async function verifyUserAdapter(data: {
  email: string;
  password: string;
}): Promise<GeneralResponse<UserWithPyme>> {
  try {
    return await verifyUserService(data);
  } catch (error) {
    console.error("Error in verifyUserAdapter:", error);
    return {
      status: "error",
      message: "Something went wrong while verifying user",
    };
  }
}
