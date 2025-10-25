import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash password para el usuario
  const hashedPassword = await bcrypt.hash("Test1234-", 10);

  // Verificar si el usuario ya existe
  let user = await prisma.users.findFirst({
    where: { user_emails: { some: { email: "admin@green-check.com" } } },
  });

  if (!user) {
    // Crear usuario
    user = await prisma.users.create({
      data: {
        first_name: "Green",
        last_name: "Check Admin",
        password: hashedPassword,
        email: "admin@green-check.com",
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Error durante seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
