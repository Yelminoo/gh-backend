import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [WarehousesService, PrismaService],
  controllers: [WarehousesController],
})
export class WarehousesModule {}
