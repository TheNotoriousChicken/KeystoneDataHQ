-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "paddleCustomerId" TEXT,
ADD COLUMN     "paddleSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_paddleCustomerId_key" ON "Company"("paddleCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_paddleSubscriptionId_key" ON "Company"("paddleSubscriptionId");
