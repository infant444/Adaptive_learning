-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "total_score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "responses" ADD COLUMN     "total_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "your_score" INTEGER NOT NULL DEFAULT 0;
