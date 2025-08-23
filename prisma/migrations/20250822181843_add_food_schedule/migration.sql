-- CreateTable
CREATE TABLE "public"."food_schedule" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "meal_type" VARCHAR(20) NOT NULL,
    "items" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_schedule_pkey" PRIMARY KEY ("id")
);
