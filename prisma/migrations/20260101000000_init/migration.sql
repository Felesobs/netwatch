-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('BROWSER', 'IN_APP');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'TRIGGERED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "UsageUnit" AS ENUM ('MB', 'GB', 'TB');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "uploadGb" DECIMAL(12,4) NOT NULL,
    "downloadGb" DECIMAL(12,4) NOT NULL,
    "provider" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalUploadGb" DECIMAL(14,4) NOT NULL,
    "totalDownloadGb" DECIMAL(14,4) NOT NULL,
    "totalGb" DECIMAL(14,4) NOT NULL,
    "quotaGb" DECIMAL(12,4),
    "daysElapsed" INTEGER NOT NULL,
    "daysRemaining" INTEGER NOT NULL,
    "dailyAverageGb" DECIMAL(12,4) NOT NULL,
    "predictedTotalGb" DECIMAL(14,4) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "channel" "AlertChannel" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" DATE NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingCycleDay" INTEGER NOT NULL DEFAULT 1,
    "usageUnit" "UsageUnit" NOT NULL DEFAULT 'GB',
    "quotaGb" DECIMAL(12,4),
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "browserNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notifyThresholds" INTEGER[] DEFAULT ARRAY[50, 80, 90, 100]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "usage_records_userId_date_idx" ON "usage_records"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_userId_date_provider_key" ON "usage_records"("userId", "date", "provider");

-- CreateIndex
CREATE INDEX "monthly_summaries_userId_periodStart_idx" ON "monthly_summaries"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_summaries_userId_periodStart_key" ON "monthly_summaries"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "alerts_userId_status_idx" ON "alerts"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_userId_periodStart_threshold_channel_key" ON "alerts"("userId", "periodStart", "threshold", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_summaries" ADD CONSTRAINT "monthly_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
