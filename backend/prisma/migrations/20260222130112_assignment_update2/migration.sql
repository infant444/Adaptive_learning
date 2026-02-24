/*
  Warnings:

  - You are about to drop the column `faculty_review` on the `assignments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assignment_responses" ADD COLUMN     "attachment" TEXT;

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "faculty_review";
