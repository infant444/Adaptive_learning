-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "result_out" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "responses" ADD COLUMN     "faculty_review" TEXT,
ADD COLUMN     "terminated_reason" TEXT;
