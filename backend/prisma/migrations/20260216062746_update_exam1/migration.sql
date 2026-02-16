/*
  Warnings:

  - You are about to drop the column `name` on the `exams` table. All the data in the column will be lost.
  - Added the required column `title` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exams" DROP COLUMN "name",
ADD COLUMN     "end_at" TIMESTAMP(3),
ADD COLUMN     "is_duration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_start" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_at" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL;
