-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('INDIVIDUAL', 'PARCEL', 'HYBRID');

-- CreateEnum
CREATE TYPE "StoneUnit" AS ENUM ('PIECE', 'CARAT', 'GRAM', 'KILOGRAM', 'SQFT', 'SLAB', 'TON', 'LOT');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('IN_STOCK', 'RESERVED', 'SOLD', 'IN_TRANSIT', 'DAMAGED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEIVED', 'SALE', 'RESERVED', 'RELEASED', 'ADJUSTMENT', 'DAMAGED', 'RETURNED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "inventoryType" "InventoryType" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "trackByParcel" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "maxCapacity" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "variantId" TEXT,
    "parcelCode" TEXT NOT NULL,
    "supplierRef" TEXT,
    "origin" TEXT,
    "qualityGrade" TEXT,
    "certification" TEXT,
    "unit" "StoneUnit" NOT NULL,
    "totalQuantity" DECIMAL(65,30) NOT NULL,
    "available" DECIMAL(65,30) NOT NULL,
    "reserved" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "minOrderQty" DECIMAL(65,30),
    "costPrice" DECIMAL(65,30),
    "wholesalePrice" DECIMAL(65,30),
    "retailPrice" DECIMAL(65,30),
    "notes" TEXT,
    "images" TEXT[],
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ParcelStatus" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelTransaction" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemAllocation" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelMovement" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "fromWarehouseId" TEXT NOT NULL,
    "toWarehouseId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "status" "MovementStatus" NOT NULL DEFAULT 'PENDING',
    "initiatedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "completedBy" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Warehouse_shopId_isActive_idx" ON "Warehouse"("shopId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_shopId_code_key" ON "Warehouse"("shopId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_parcelCode_key" ON "Parcel"("parcelCode");

-- CreateIndex
CREATE INDEX "Parcel_shopId_status_idx" ON "Parcel"("shopId", "status");

-- CreateIndex
CREATE INDEX "Parcel_warehouseId_status_idx" ON "Parcel"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "Parcel_variantId_idx" ON "Parcel"("variantId");

-- CreateIndex
CREATE INDEX "Parcel_parcelCode_idx" ON "Parcel"("parcelCode");

-- CreateIndex
CREATE INDEX "ParcelTransaction_parcelId_createdAt_idx" ON "ParcelTransaction"("parcelId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_orderItemId_idx" ON "OrderItemAllocation"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_parcelId_idx" ON "OrderItemAllocation"("parcelId");

-- CreateIndex
CREATE INDEX "ParcelMovement_parcelId_status_idx" ON "ParcelMovement"("parcelId", "status");

-- CreateIndex
CREATE INDEX "ParcelMovement_fromWarehouseId_idx" ON "ParcelMovement"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "ParcelMovement_toWarehouseId_idx" ON "ParcelMovement"("toWarehouseId");

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelTransaction" ADD CONSTRAINT "ParcelTransaction_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAllocation" ADD CONSTRAINT "OrderItemAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAllocation" ADD CONSTRAINT "OrderItemAllocation_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelMovement" ADD CONSTRAINT "ParcelMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelMovement" ADD CONSTRAINT "ParcelMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
