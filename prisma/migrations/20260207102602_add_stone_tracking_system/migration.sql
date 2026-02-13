/*
  Warnings:

  - You are about to drop the column `trackByParcel` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InventorySource" AS ENUM ('UNIT', 'PARCEL_BULK', 'PARCEL_SINGLE');

-- CreateEnum
CREATE TYPE "TrackingMode" AS ENUM ('SINGLE', 'BULK');

-- CreateEnum
CREATE TYPE "StoneType" AS ENUM ('DIAMOND', 'RUBY', 'SAPPHIRE', 'EMERALD', 'AMETHYST', 'TOPAZ', 'GARNET', 'PEARL', 'OPAL', 'JADE', 'TOURMALINE', 'PERIDOT', 'AQUAMARINE', 'TANZANITE', 'CITRINE', 'ONYX', 'TURQUOISE', 'LAPIS_LAZULI', 'MOONSTONE', 'ALEXANDRITE', 'SPINEL', 'ZIRCON', 'OTHER');

-- CreateEnum
CREATE TYPE "FinishType" AS ENUM ('ROUGH', 'POLISHED');

-- CreateEnum
CREATE TYPE "StoneStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ASSIGNED', 'SOLD', 'DAMAGED', 'RETURNED');

-- CreateEnum
CREATE TYPE "StoneLifecycleEvent" AS ENUM ('RECEIVED', 'GRADED', 'CERTIFIED', 'LISTED', 'RESERVED', 'RELEASED', 'SOLD', 'SHIPPED', 'RETURNED', 'DAMAGED', 'REPAIRED', 'RECUT', 'TRANSFERRED', 'SPLIT', 'COMBINED', 'ADJUSTED');

-- AlterTable
ALTER TABLE "OrderItemAllocation" ADD COLUMN     "allocatedPrice" DECIMAL(65,30),
ADD COLUMN     "stoneId" TEXT;

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "parcelReportRef" TEXT,
ADD COLUMN     "stoneProfileId" TEXT,
ADD COLUMN     "stoneType" "StoneType",
ADD COLUMN     "trackingMode" "TrackingMode" NOT NULL DEFAULT 'BULK';

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "trackByParcel",
ADD COLUMN     "inventorySource" "InventorySource" NOT NULL DEFAULT 'UNIT';

-- CreateTable
CREATE TABLE "StoneProfile" (
    "id" TEXT NOT NULL,
    "stoneType" "StoneType" NOT NULL,
    "shape" TEXT,
    "finishType" "FinishType" NOT NULL,
    "color" TEXT,
    "clarity" TEXT,
    "cut" TEXT,
    "polish" TEXT,
    "symmetry" TEXT,
    "fluorescence" TEXT,
    "treatment" TEXT,
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoneProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stone" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "stoneProfileId" TEXT NOT NULL,
    "stoneCode" TEXT NOT NULL,
    "internalRef" TEXT,
    "supplierStoneRef" TEXT,
    "carat" DECIMAL(65,30) NOT NULL,
    "length" DECIMAL(65,30),
    "width" DECIMAL(65,30),
    "depth" DECIMAL(65,30),
    "laserInscription" TEXT,
    "certificateNumber" TEXT,
    "certificateIssuer" TEXT,
    "certificateDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "costPrice" DECIMAL(65,30),
    "wholesalePrice" DECIMAL(65,30),
    "retailPrice" DECIMAL(65,30),
    "status" "StoneStatus" NOT NULL DEFAULT 'AVAILABLE',
    "binLocation" TEXT,
    "notes" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoneLifecycle" (
    "id" TEXT NOT NULL,
    "stoneId" TEXT NOT NULL,
    "event" "StoneLifecycleEvent" NOT NULL,
    "fromStatus" "StoneStatus",
    "toStatus" "StoneStatus",
    "orderId" TEXT,
    "userId" TEXT,
    "warehouseId" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoneLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoneAllocation" (
    "id" TEXT NOT NULL,
    "stoneId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "allocatedPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoneAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoneProfile_stoneType_finishType_idx" ON "StoneProfile"("stoneType", "finishType");

-- CreateIndex
CREATE UNIQUE INDEX "Stone_stoneCode_key" ON "Stone"("stoneCode");

-- CreateIndex
CREATE INDEX "Stone_parcelId_idx" ON "Stone"("parcelId");

-- CreateIndex
CREATE INDEX "Stone_stoneProfileId_idx" ON "Stone"("stoneProfileId");

-- CreateIndex
CREATE INDEX "Stone_status_idx" ON "Stone"("status");

-- CreateIndex
CREATE INDEX "Stone_certificateNumber_idx" ON "Stone"("certificateNumber");

-- CreateIndex
CREATE INDEX "StoneLifecycle_stoneId_createdAt_idx" ON "StoneLifecycle"("stoneId", "createdAt");

-- CreateIndex
CREATE INDEX "StoneLifecycle_event_idx" ON "StoneLifecycle"("event");

-- CreateIndex
CREATE INDEX "StoneAllocation_orderItemId_idx" ON "StoneAllocation"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "StoneAllocation_stoneId_orderItemId_key" ON "StoneAllocation"("stoneId", "orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_stoneId_idx" ON "OrderItemAllocation"("stoneId");

-- CreateIndex
CREATE INDEX "Parcel_trackingMode_status_idx" ON "Parcel"("trackingMode", "status");

-- CreateIndex
CREATE INDEX "Parcel_stoneType_idx" ON "Parcel"("stoneType");

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_stoneProfileId_fkey" FOREIGN KEY ("stoneProfileId") REFERENCES "StoneProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stone" ADD CONSTRAINT "Stone_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stone" ADD CONSTRAINT "Stone_stoneProfileId_fkey" FOREIGN KEY ("stoneProfileId") REFERENCES "StoneProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoneLifecycle" ADD CONSTRAINT "StoneLifecycle_stoneId_fkey" FOREIGN KEY ("stoneId") REFERENCES "Stone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoneAllocation" ADD CONSTRAINT "StoneAllocation_stoneId_fkey" FOREIGN KEY ("stoneId") REFERENCES "Stone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoneAllocation" ADD CONSTRAINT "StoneAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
