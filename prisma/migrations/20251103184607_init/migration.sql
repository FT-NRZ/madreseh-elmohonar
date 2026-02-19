/*
  Warnings:

  - You are about to drop the column `grade_id` on the `exams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_grade_id_fkey";

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "grade_id";
