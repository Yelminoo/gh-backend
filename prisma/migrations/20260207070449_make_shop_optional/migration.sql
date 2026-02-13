-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_shopId_fkey";

-- AlterTable
ALTER TABLE "Parcel" ALTER COLUMN "shopId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Warehouse" ALTER COLUMN "shopId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
