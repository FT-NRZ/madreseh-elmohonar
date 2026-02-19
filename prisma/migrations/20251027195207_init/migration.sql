-- AlterTable
ALTER TABLE "public"."exams" ADD COLUMN     "grade_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."exams" ADD CONSTRAINT "exams_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
