/*
  Warnings:

  - The `instructions` column on the `exams` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "exams" DROP COLUMN "instructions",
ADD COLUMN     "instructions" JSONB;
