-- CreateTable
CREATE TABLE "public"."breakfast_reservations" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breakfast_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "breakfast_reservations_student_id_schedule_id_key" ON "public"."breakfast_reservations"("student_id", "schedule_id");
CREATE INDEX "breakfast_reservations_schedule_id_idx" ON "public"."breakfast_reservations"("schedule_id");

-- AddForeignKey
ALTER TABLE "public"."breakfast_reservations" ADD CONSTRAINT "breakfast_reservations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."breakfast_reservations" ADD CONSTRAINT "breakfast_reservations_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."food_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
