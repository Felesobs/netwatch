-- Fix: provider column was nullable, which breaks the unique constraint
-- on (userId, date, provider) in PostgreSQL because NULL != NULL means
-- multiple rows with provider=NULL could be inserted for the same date.
-- We coerce NULL -> '' (empty string = "no provider") and add NOT NULL.

-- Step 1: backfill existing NULLs
UPDATE "usage_records" SET "provider" = '' WHERE "provider" IS NULL;

-- Step 2: add NOT NULL constraint now that no NULLs remain
ALTER TABLE "usage_records" ALTER COLUMN "provider" SET NOT NULL;
ALTER TABLE "usage_records" ALTER COLUMN "provider" SET DEFAULT '';

-- Step 3: add billingCycleDay range check (application already enforces
-- 1-28 but defence-in-depth at the DB level is cheap)
ALTER TABLE "settings"
  ADD CONSTRAINT "settings_billingCycleDay_check"
  CHECK ("billingCycleDay" BETWEEN 1 AND 28);
