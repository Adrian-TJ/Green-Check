"use server";

import { z } from "zod";
import { compare } from "bcrypt";
import { db } from "@/utils/db";
import type { GeneralResponse } from "@/models/generalResponse";
import type { UserWithPyme } from "../models/User";

const verifyUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function verifyUserService(
  data: z.infer<typeof verifyUserSchema>
): Promise<GeneralResponse<UserWithPyme>> {
  try {
    // Validate input
    const validated = verifyUserSchema.parse(data);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validated.email },
      include: { pyme: true },
    });

    console.log("[verifyUserService] Found user:", user);

    if (!user) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // Verify password
    const isPasswordValid = await compare(validated.password, user.password);

    if (!isPasswordValid) {
      return {
        status: "error",
        message: "Invalid email or password",
      };
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    console.log("[verifyUserService] Returning user without password:", userWithoutPassword);
    console.log("[verifyUserService] User has pyme:", !!userWithoutPassword.pyme, userWithoutPassword.pyme);

    return {
      status: "success",
      message: "User verified successfully",
      data: userWithoutPassword,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: error.issues[0]?.message || "Validation error",
      };
    }

    console.error("Error verifying user:", error);
    return {
      status: "error",
      message: "An error occurred while verifying user",
    };
  }
}
