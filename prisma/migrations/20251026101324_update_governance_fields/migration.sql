/*
  Warnings:

  - You are about to drop the column `anti_corrupcion` on the `governance` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_etica` on the `governance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "governance" DROP COLUMN "anti_corrupcion",
DROP COLUMN "codigo_etica",
ADD COLUMN     "anti_corrupcion_url" TEXT,
ADD COLUMN     "codigo_etica_url" TEXT;
