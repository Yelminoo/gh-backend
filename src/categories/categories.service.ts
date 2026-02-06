import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page?: number, limit?: number, search?: string) {
    // If no pagination params, return all categories (backward compatible)
    if (!page && !limit) {
      const where: Prisma.CategoryWhereInput = {
        isActive: true,
        ...(search && {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }),
      };

      return this.prisma.category.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
      });
    }

    // With pagination
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.CategoryWhereInput = {
      isActive: true,
      ...(search && {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limitNum,
      }),
      this.prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      items,
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNum,
    };
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }
}
