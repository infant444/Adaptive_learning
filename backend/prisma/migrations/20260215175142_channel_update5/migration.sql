-- AlterTable
ALTER TABLE "channels" ALTER COLUMN "team_members" SET DEFAULT ARRAY[]::TEXT[];
