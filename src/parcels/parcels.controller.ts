import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  create(@Body() createParcelDto: CreateParcelDto) {
    return this.parcelsService.create(createParcelDto);
  }

  @Get()
  findAll(
    @Query('shopId') shopId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('variantId') variantId?: string,
    @Query('trackingMode') trackingMode?: string,
    @Query('stoneType') stoneType?: string,
  ) {
    return this.parcelsService.findAll(
      shopId,
      warehouseId,
      status,
      variantId,
      trackingMode,
      stoneType,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parcelsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParcelDto: UpdateParcelDto) {
    return this.parcelsService.update(id, updateParcelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parcelsService.remove(id);
  }
}
