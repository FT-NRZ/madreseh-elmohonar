/*
  Warnings:

  - You are about to drop the column `date` on the `food_schedule` table. All the data in the column will be lost.
  - You are about to drop the column `items` on the `food_schedule` table. All the data in the column will be lost.
  - You are about to drop the column `meal_type` on the `food_schedule` table. All the data in the column will be lost.
  - Added the required column `week_start` to the `food_schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekday` to the `food_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."food_schedule" DROP COLUMN "date",
DROP COLUMN "items",
DROP COLUMN "meal_type",
ADD COLUMN     "breakfast" TEXT,
ADD COLUMN     "lunch" TEXT,
ADD COLUMN     "week_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weekday" TEXT NOT NULL;
