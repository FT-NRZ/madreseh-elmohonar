-- CreateTable
CREATE TABLE "public"."exam_file_answers" (
    "id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_file_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."exam_file_answers" ADD CONSTRAINT "exam_file_answers_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_file_answers" ADD CONSTRAINT "exam_file_answers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
