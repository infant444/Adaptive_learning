/*
  Warnings:

  - Added the required column `analyses` to the `responses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "responses" ADD COLUMN     "analyses" JSONB NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_analysis" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_terminated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "violations" TEXT[] DEFAULT ARRAY[]::TEXT[];
