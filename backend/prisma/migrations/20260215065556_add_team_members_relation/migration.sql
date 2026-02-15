/*
  Warnings:

  - You are about to drop the column `team_members` on the `channels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "team_members";

-- CreateTable
CREATE TABLE "_team_members" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_team_members_AB_unique" ON "_team_members"("A", "B");

-- CreateIndex
CREATE INDEX "_team_members_B_index" ON "_team_members"("B");

-- AddForeignKey
ALTER TABLE "_team_members" ADD CONSTRAINT "_team_members_A_fkey" FOREIGN KEY ("A") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_team_members" ADD CONSTRAINT "_team_members_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
