/*
  Warnings:

  - You are about to drop the column `private` on the `channels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "private",
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false;
