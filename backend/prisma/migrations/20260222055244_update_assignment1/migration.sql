/*
  Warnings:

  - You are about to drop the column `end_at` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `is_start` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `start_at` on the `assignments` table. All the data in the column will be lost.
  - Added the required column `last_date` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "end_at",
DROP COLUMN "is_start",
DROP COLUMN "start_at",
ADD COLUMN     "last_date" TIMESTAMP(3) NOT NULL;
