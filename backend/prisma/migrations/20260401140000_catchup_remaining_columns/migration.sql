-- AlterTable Company
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "paddleCustomerId" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "paddleSubscriptionId" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

ALTER TABLE "Company" DROP COLUMN IF EXISTS "lemonSqueezyCustomerId";
ALTER TABLE "Company" DROP COLUMN IF EXISTS "lemonSqueezySubscriptionId";

CREATE UNIQUE INDEX IF NOT EXISTS "Company_paddleCustomerId_key" ON "Company"("paddleCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_paddleSubscriptionId_key" ON "Company"("paddleSubscriptionId");

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
