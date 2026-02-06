import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { variants, ...productData } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants
          ? {
              create: variants.map((variant) => ({
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                attributes: variant.attributes || {},
              })),
            }
          : undefined,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        variants: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        variants: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.product.delete({
      where: { id },
    });
  }

  uploadImage(file: { filename: string; path: string }) {
    // For now, we'll just return the filename
    // In production, you'd upload to S3, Cloudinary, etc.
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
