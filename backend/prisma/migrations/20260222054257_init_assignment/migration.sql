-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project_type" TEXT,
    "description" TEXT,
    "is_questions" BOOLEAN NOT NULL DEFAULT false,
    "question_count" INTEGER,
    "questions" JSONB NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "exam_type" "TestType" NOT NULL,
    "faculty_review" TEXT,
    "is_start" BOOLEAN NOT NULL DEFAULT false,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "channel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_responses" (
    "id" TEXT NOT NULL,
    "response" JSONB,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "your_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_analysis" BOOLEAN NOT NULL DEFAULT false,
    "analyses" JSONB,
    "faculty_review" TEXT,
    "assignment_id" TEXT NOT NULL,
    "student_id" TEXT,
    "faculty_id" TEXT,

    CONSTRAINT "assignment_responses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_responses" ADD CONSTRAINT "assignment_responses_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_responses" ADD CONSTRAINT "assignment_responses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_responses" ADD CONSTRAINT "assignment_responses_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
