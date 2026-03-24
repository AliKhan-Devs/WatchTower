-- CreateTable
CREATE TABLE "UptimeEvent" (
    "id" TEXT NOT NULL,
    "uptimeCheckId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UptimeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UptimeEvent_uptimeCheckId_timestamp_idx" ON "UptimeEvent"("uptimeCheckId", "timestamp");

-- AddForeignKey
ALTER TABLE "UptimeEvent" ADD CONSTRAINT "UptimeEvent_uptimeCheckId_fkey" FOREIGN KEY ("uptimeCheckId") REFERENCES "UptimeCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
