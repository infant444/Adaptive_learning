/*
  Warnings:

  - You are about to drop the `exam_assignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exam_assignments" DROP CONSTRAINT "exam_assignments_assigned_by_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_assignments" DROP CONSTRAINT "exam_assignments_assigned_to_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_assignments" DROP CONSTRAINT "exam_assignments_exam_id_fkey";

-- DropTable
DROP TABLE "exam_assignments";

-- CreateTable
CREATE TABLE "exam_feedbacks" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "exam_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_feedbacks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exam_feedbacks" ADD CONSTRAINT "exam_feedbacks_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_feedbacks" ADD CONSTRAINT "exam_feedbacks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
