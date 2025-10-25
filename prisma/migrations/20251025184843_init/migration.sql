-- CreateEnum
CREATE TYPE "resourceType" AS ENUM ('AGUA', 'LUZ', 'GAS', 'TRANSPORTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pyme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pyme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "resourceType" NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pymeId" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governance" (
    "id" TEXT NOT NULL,
    "codigo_etica" BOOLEAN NOT NULL,
    "anti_corrupcion" BOOLEAN NOT NULL,
    "risk_file_url" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pymeId" TEXT,

    CONSTRAINT "governance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social" (
    "id" TEXT NOT NULL,
    "men" INTEGER NOT NULL,
    "women" INTEGER NOT NULL,
    "men_in_leadership" INTEGER NOT NULL,
    "women_in_leadership" INTEGER NOT NULL,
    "training_hours" INTEGER NOT NULL,
    "satisfaction_rate" DOUBLE PRECISION NOT NULL,
    "community_programs" BOOLEAN NOT NULL,
    "insured_employees" INTEGER NOT NULL,
    "uninsured_employees" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pymeId" TEXT,

    CONSTRAINT "social_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pyme_email_key" ON "Pyme"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pyme_userId_key" ON "Pyme"("userId");

-- AddForeignKey
ALTER TABLE "Pyme" ADD CONSTRAINT "Pyme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_pymeId_fkey" FOREIGN KEY ("pymeId") REFERENCES "Pyme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "governance" ADD CONSTRAINT "governance_pymeId_fkey" FOREIGN KEY ("pymeId") REFERENCES "Pyme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social" ADD CONSTRAINT "social_pymeId_fkey" FOREIGN KEY ("pymeId") REFERENCES "Pyme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
