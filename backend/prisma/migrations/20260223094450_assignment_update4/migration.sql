-- AlterTable
ALTER TABLE "assignment_responses" ADD COLUMN     "is_terminated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "terminated_reason" TEXT,
ADD COLUMN     "violations" TEXT[] DEFAULT ARRAY[]::TEXT[];
