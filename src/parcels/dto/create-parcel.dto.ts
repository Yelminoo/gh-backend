import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TrackingMode,
  StoneType,
  StoneUnit,
  ParcelStatus,
} from '@prisma/client';

export class CreateParcelDto {
  @IsString()
  @IsOptional()
  shopId?: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsNotEmpty()
  parcelCode!: string;

  @IsString()
  @IsOptional()
  supplierRef?: string;

  @IsEnum(TrackingMode)
  @IsOptional()
  trackingMode?: TrackingMode;

  @IsEnum(StoneType)
  @IsOptional()
  stoneType?: StoneType;

  @IsString()
  @IsOptional()
  stoneProfileId?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  qualityGrade?: string;

  @IsString()
  @IsOptional()
  certification?: string;

  @IsString()
  @IsOptional()
  parcelReportRef?: string;

  @IsEnum(StoneUnit)
  @IsNotEmpty()
  unit!: StoneUnit;

  @Type(() => Number)
  @IsNotEmpty()
  totalQuantity!: number;

  @Type(() => Number)
  @IsNotEmpty()
  available!: number;

  @Type(() => Number)
  @IsOptional()
  reserved?: number;

  @Type(() => Number)
  @IsOptional()
  minOrderQty?: number;

  @Type(() => Number)
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsOptional()
  wholesalePrice?: number;

  @Type(() => Number)
  @IsOptional()
  retailPrice?: number;

  @IsEnum(ParcelStatus)
  @IsOptional()
  status?: ParcelStatus;

  @IsBoolean()
  @IsOptional()
  sellable?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
