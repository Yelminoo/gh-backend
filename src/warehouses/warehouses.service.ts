import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    // Clean up shopId - remove if empty string or invalid
    const cleanedData = { ...createWarehouseDto };
    if (!cleanedData.shopId || cleanedData.shopId.trim() === '') {
      delete cleanedData.shopId;
    }

    // If isPrimary is true and shopId exists, unset other primary warehouses for this shop
    if (cleanedData.isPrimary && cleanedData.shopId) {
      await this.prisma.warehouse.updateMany({
        where: {
          shopId: cleanedData.shopId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.warehouse.create({
      data: {
        ...cleanedData,
        maxCapacity: cleanedData.maxCapacity
          ? new Prisma.Decimal(cleanedData.maxCapacity)
          : null,
      },
      include: {
        shop: cleanedData.shopId
          ? {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            }
          : false,
      },
    });
  }

  async findAll(
    shopId?: string,
    isActive?: boolean,
    type?: 'PHYSICAL' | 'VIRTUAL',
  ) {
    const where: Prisma.WarehouseWhereInput = {};

    if (shopId) {
      where.shopId = shopId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.warehouse.findMany({
      where,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            parcels: true,
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            parcels: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    // Check if warehouse exists
    await this.findOne(id);

    // If setting as primary, unset other primary warehouses
    if (updateWarehouseDto.isPrimary) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id },
        select: { shopId: true },
      });

      if (warehouse) {
        await this.prisma.warehouse.updateMany({
          where: {
            shopId: warehouse.shopId,
            isPrimary: true,
            NOT: { id },
          },
          data: {
            isPrimary: false,
          },
        });
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: {
        ...updateWarehouseDto,
        maxCapacity: updateWarehouseDto.maxCapacity
          ? new Prisma.Decimal(updateWarehouseDto.maxCapacity)
          : undefined,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if warehouse exists
    await this.findOne(id);

    // Check if warehouse has parcels
    const parcelCount = await this.prisma.parcel.count({
      where: { warehouseId: id },
    });

    if (parcelCount > 0) {
      throw new Error(
        `Cannot delete warehouse with ${parcelCount} parcels. Please relocate or remove parcels first.`,
      );
    }

    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  // Get stock summary for a warehouse
  async getStockSummary(warehouseId: string) {
    await this.findOne(warehouseId);

    const parcels = await this.prisma.parcel.findMany({
      where: { warehouseId },
      select: {
        status: true,
        available: true,
        reserved: true,
        unit: true,
      },
    });

    const summary = {
      totalParcels: parcels.length,
      totalAvailable: parcels.reduce((sum, p) => sum + Number(p.available), 0),
      totalReserved: parcels.reduce((sum, p) => sum + Number(p.reserved), 0),
      byStatus: parcels.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byUnit: parcels.reduce(
        (acc, p) => {
          if (!acc[p.unit]) {
            acc[p.unit] = { count: 0, available: 0, reserved: 0 };
          }
          acc[p.unit].count++;
          acc[p.unit].available += Number(p.available);
          acc[p.unit].reserved += Number(p.reserved);
          return acc;
        },
        {} as Record<
          string,
          { count: number; available: number; reserved: number }
        >,
      ),
    };

    return summary;
  }
}
