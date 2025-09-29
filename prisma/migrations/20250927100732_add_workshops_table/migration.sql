-- DropForeignKey
ALTER TABLE "public"."exam_file_answers" DROP CONSTRAINT "exam_file_answers_student_id_fkey";

-- AlterTable
ALTER TABLE "public"."attendances" ADD COLUMN     "delay_minutes" INTEGER,
ADD COLUMN     "delay_reason" VARCHAR(200);

-- AlterTable
ALTER TABLE "public"."exam_file_answers" ADD COLUMN     "grade_desc" TEXT,
ADD COLUMN     "teacher_feedback" TEXT;

-- AlterTable
ALTER TABLE "public"."exam_results" ADD COLUMN     "grade_desc" TEXT,
ALTER COLUMN "marks_obtained" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."gallery_images" ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."news_announcements" ADD COLUMN     "image_url" VARCHAR(255),
ADD COLUMN     "target_type" VARCHAR(20) NOT NULL DEFAULT 'public',
ADD COLUMN     "target_user_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "teaching_type" VARCHAR(20) NOT NULL DEFAULT 'grade',
ADD COLUMN     "workshop_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."special_classes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "class_id" INTEGER,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_teacher" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workshops" (
    "id" SERIAL NOT NULL,
    "workshop_name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(10),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."circulars" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "target_type" VARCHAR(20) NOT NULL DEFAULT 'all_teachers',
    "target_teacher_id" INTEGER,
    "issue_date" DATE NOT NULL,
    "expiry_duration" VARCHAR(20) NOT NULL DEFAULT '1_month',
    "expiry_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_read_required" BOOLEAN NOT NULL DEFAULT false,
    "author_id" INTEGER,
    "circular_number" VARCHAR(50),
    "department" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circulars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."circular_reads" (
    "id" SERIAL NOT NULL,
    "circular_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "read_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circular_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."disciplinary_actions" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "level" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "author_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disciplinary_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_news" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "target_type" VARCHAR(20) NOT NULL,
    "target_grade_id" INTEGER,
    "target_student_id" INTEGER,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "reminder_date" DATE,
    "author_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_teacher_student_id_teacher_id_key" ON "public"."student_teacher"("student_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "circular_reads_circular_id_teacher_id_key" ON "public"."circular_reads"("circular_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "public"."gallery_images" ADD CONSTRAINT "gallery_images_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."news_announcements" ADD CONSTRAINT "news_announcements_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_file_answers" ADD CONSTRAINT "exam_file_answers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."special_classes" ADD CONSTRAINT "special_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_teacher" ADD CONSTRAINT "student_teacher_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_teacher" ADD CONSTRAINT "student_teacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."circulars" ADD CONSTRAINT "circulars_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."circulars" ADD CONSTRAINT "circulars_target_teacher_id_fkey" FOREIGN KEY ("target_teacher_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."circular_reads" ADD CONSTRAINT "circular_reads_circular_id_fkey" FOREIGN KEY ("circular_id") REFERENCES "public"."circulars"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."circular_reads" ADD CONSTRAINT "circular_reads_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."disciplinary_actions" ADD CONSTRAINT "disciplinary_actions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."disciplinary_actions" ADD CONSTRAINT "disciplinary_actions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teacher_news" ADD CONSTRAINT "teacher_news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teacher_news" ADD CONSTRAINT "teacher_news_target_grade_id_fkey" FOREIGN KEY ("target_grade_id") REFERENCES "public"."grades"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teacher_news" ADD CONSTRAINT "teacher_news_target_student_id_fkey" FOREIGN KEY ("target_student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
