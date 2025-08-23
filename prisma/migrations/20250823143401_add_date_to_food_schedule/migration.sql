/*
  Warnings:

  - Added the required column `date` to the `food_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."food_schedule" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
