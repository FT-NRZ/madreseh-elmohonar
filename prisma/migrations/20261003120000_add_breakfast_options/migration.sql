-- AlterTable: تبدیل صبحانه به سه گزینه مجزا
ALTER TABLE "food_schedule" RENAME COLUMN "breakfast" TO "breakfast_1";
ALTER TABLE "food_schedule" ADD COLUMN "breakfast_2" TEXT,
ADD COLUMN "breakfast_3" TEXT;

-- AlterTable: ذخیره شماره گزینه رزرو شده توسط دانش‌آموز
ALTER TABLE "breakfast_reservations" ADD COLUMN "option_index" INTEGER NOT NULL DEFAULT 1;
