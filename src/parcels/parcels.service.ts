import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { Prisma, StoneUnit, ParcelStatus, TrackingMode } from '@prisma/client';

@Injectable()
export class ParcelsService {
  constructor(private prisma: PrismaService) {}

  async create(createParcelDto: CreateParcelDto) {
    // Clean up shopId - remove if empty string or invalid
    const cleanedData = { ...createParcelDto };
    if (!cleanedData.shopId || cleanedData.shopId.trim() === '') {
      delete cleanedData.shopId;
    }

    return this.prisma.parcel.create({
      data: {
        shopId: cleanedData.shopId,
        warehouseId: cleanedData.warehouseId,
        variantId: cleanedData.variantId || null,
        parcelCode: cleanedData.parcelCode,
        supplierRef: cleanedData.supplierRef || null,
        trackingMode: cleanedData.trackingMode || 'BULK',
        stoneType: cleanedData.stoneType || null,
        stoneProfileId: cleanedData.stoneProfileId || null,
        origin: cleanedData.origin || null,
        qualityGrade: cleanedData.qualityGrade || null,
        certification: cleanedData.certification || null,
        parcelReportRef: cleanedData.parcelReportRef || null,
        unit: cleanedData.unit,
        totalQuantity: new Prisma.Decimal(cleanedData.totalQuantity),
        available: new Prisma.Decimal(cleanedData.available),
        reserved: cleanedData.reserved
          ? new Prisma.Decimal(cleanedData.reserved)
          : new Prisma.Decimal(0),
        minOrderQty: cleanedData.minOrderQty
          ? new Prisma.Decimal(cleanedData.minOrderQty)
          : null,
        costPrice: cleanedData.costPrice
          ? new Prisma.Decimal(cleanedData.costPrice)
          : null,
        wholesalePrice: cleanedData.wholesalePrice
          ? new Prisma.Decimal(cleanedData.wholesalePrice)
          : null,
        retailPrice: cleanedData.retailPrice
          ? new Prisma.Decimal(cleanedData.retailPrice)
          : null,
        status: cleanedData.status || 'IN_STOCK',
        sellable: cleanedData.sellable ?? false,
        notes: cleanedData.notes || null,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stoneProfile: {
          select: {
            id: true,
            stoneType: true,
            shape: true,
            finishType: true,
            color: true,
            clarity: true,
            cut: true,
            origin: true,
          },
        },
        stones: {
          select: {
            id: true,
            stoneCode: true,
            carat: true,
            status: true,
            certificateNumber: true,
            retailPrice: true,
          },
          where: {
            status: 'AVAILABLE',
          },
          take: 10, // Only return first 10 stones for list view
        },
      },
    });
  }

  async findAll(
    shopId?: string,
    warehouseId?: string,
    status?: string,
    variantId?: string,
    trackingMode?: string,
    stoneType?: string,
  ) {
    const where: Prisma.ParcelWhereInput = {};

    if (shopId) {
      where.shopId = shopId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (status) {
      where.status = status as ParcelStatus;
    }

    if (variantId) {
      where.variantId = variantId;
    }

    if (trackingMode) {
      where.trackingMode = trackingMode as any;
    }

    if (stoneType) {
      where.stoneType = stoneType as any;
    }

    return this.prisma.parcel.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stoneProfile: {
          select: {
            id: true,
            stoneType: true,
            shape: true,
            color: true,
            clarity: true,
          },
        },
        _count: {
          select: {
            stones: true,
          },
        },
      },
      orderBy: {
        receivedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        stoneProfile: true,
        stones: {
          orderBy: {
            stoneCode: 'asc',
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            stones: true,
            transactions: true,
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundException(`Parcel with ID ${id} not found`);
    }

    return parcel;
  }

  async update(id: string, updateParcelDto: UpdateParcelDto) {
    await this.findOne(id);

    const data: Prisma.ParcelUpdateInput = {};

    if (updateParcelDto.warehouseId) {
      data.warehouse = { connect: { id: updateParcelDto.warehouseId } };
    }
    if (updateParcelDto.variantId) {
      data.variant = { connect: { id: updateParcelDto.variantId } };
    }
    if (updateParcelDto.parcelCode)
      data.parcelCode = updateParcelDto.parcelCode;
    if (updateParcelDto.supplierRef !== undefined)
      data.supplierRef = updateParcelDto.supplierRef;
    if (updateParcelDto.trackingMode !== undefined)
      data.trackingMode = updateParcelDto.trackingMode;
    if (updateParcelDto.stoneType !== undefined)
      data.stoneType = updateParcelDto.stoneType;
    if (updateParcelDto.stoneProfileId !== undefined) {
      data.stoneProfile = updateParcelDto.stoneProfileId
        ? { connect: { id: updateParcelDto.stoneProfileId } }
        : { disconnect: true };
    }
    if (updateParcelDto.origin !== undefined)
      data.origin = updateParcelDto.origin;
    if (updateParcelDto.qualityGrade !== undefined)
      data.qualityGrade = updateParcelDto.qualityGrade;
    if (updateParcelDto.certification !== undefined)
      data.certification = updateParcelDto.certification;
    if (updateParcelDto.parcelReportRef !== undefined)
      data.parcelReportRef = updateParcelDto.parcelReportRef;
    if (updateParcelDto.unit) data.unit = updateParcelDto.unit;
    if (updateParcelDto.totalQuantity !== undefined)
      data.totalQuantity = new Prisma.Decimal(updateParcelDto.totalQuantity);
    if (updateParcelDto.available !== undefined)
      data.available = new Prisma.Decimal(updateParcelDto.available);
    if (updateParcelDto.reserved !== undefined)
      data.reserved = new Prisma.Decimal(updateParcelDto.reserved);
    if (updateParcelDto.minOrderQty !== undefined)
      data.minOrderQty = updateParcelDto.minOrderQty
        ? new Prisma.Decimal(updateParcelDto.minOrderQty)
        : null;
    if (updateParcelDto.costPrice !== undefined)
      data.costPrice = updateParcelDto.costPrice
        ? new Prisma.Decimal(updateParcelDto.costPrice)
        : null;
    if (updateParcelDto.wholesalePrice !== undefined)
      data.wholesalePrice = updateParcelDto.wholesalePrice
        ? new Prisma.Decimal(updateParcelDto.wholesalePrice)
        : null;
    if (updateParcelDto.retailPrice !== undefined)
      data.retailPrice = updateParcelDto.retailPrice
        ? new Prisma.Decimal(updateParcelDto.retailPrice)
        : null;
    if (updateParcelDto.status)
      data.status = updateParcelDto.status;
    if (updateParcelDto.sellable !== undefined)
      data.sellable = updateParcelDto.sellable;
    if (updateParcelDto.notes !== undefined) data.notes = updateParcelDto.notes;

    return this.prisma.parcel.update({
      where: { id },
      data,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.parcel.delete({
      where: { id },
    });
  }
}
