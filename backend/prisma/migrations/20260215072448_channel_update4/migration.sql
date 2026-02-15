/*
  Warnings:

  - You are about to drop the `_team_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_team_members" DROP CONSTRAINT "_team_members_A_fkey";

-- DropForeignKey
ALTER TABLE "_team_members" DROP CONSTRAINT "_team_members_B_fkey";

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "team_members" TEXT[];

-- DropTable
DROP TABLE "_team_members";
