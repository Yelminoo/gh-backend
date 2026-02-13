import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { StoneType, FinishType, StoneStatus } from '@prisma/client';

// DTO for creating a Stone Profile
export class CreateStoneProfileDto {
  @IsEnum(StoneType)
  stoneType!: StoneType;

  @IsOptional()
  @IsString()
  shape?: string;

  @IsEnum(FinishType)
  finishType!: FinishType;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  clarity?: string;

  @IsOptional()
  @IsString()
  cut?: string;

  @IsOptional()
  @IsString()
  polish?: string;

  @IsOptional()
  @IsString()
  symmetry?: string;

  @IsOptional()
  @IsString()
  fluorescence?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsString()
  origin?: string;
}

// DTO for creating an individual Stone
export class CreateStoneDto {
  @IsString()
  parcelId!: string;

  @IsString()
  stoneProfileId!: string;

  @IsString()
  stoneCode!: string;

  @IsOptional()
  @IsString()
  internalRef?: string;

  @IsOptional()
  @IsString()
  supplierStoneRef?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  carat!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  depth?: number;

  @IsOptional()
  @IsString()
  laserInscription?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  certificateIssuer?: string;

  @IsOptional()
  @IsDateString()
  certificateDate?: string;

  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  retailPrice?: number;

  @IsOptional()
  @IsEnum(StoneStatus)
  status?: StoneStatus;

  @IsOptional()
  @IsString()
  binLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// DTO for updating a Stone
export class UpdateStoneDto {
  @IsOptional()
  @IsString()
  internalRef?: string;

  @IsOptional()
  @IsString()
  supplierStoneRef?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  carat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  depth?: number;

  @IsOptional()
  @IsString()
  laserInscription?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  certificateIssuer?: string;

  @IsOptional()
  @IsDateString()
  certificateDate?: string;

  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  retailPrice?: number;

  @IsOptional()
  @IsEnum(StoneStatus)
  status?: StoneStatus;

  @IsOptional()
  @IsString()
  binLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

// DTO for bulk creating stones (for SINGLE mode parcels)
export class BulkCreateStonesDto {
  @IsString()
  parcelId!: string;

  @IsString()
  stoneProfileId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStoneDto)
  stones!: Omit<CreateStoneDto, 'parcelId' | 'stoneProfileId'>[];
}

// DTO for querying stones
export class QueryStonesDto {
  @IsOptional()
  @IsEnum(StoneType)
  stoneType?: StoneType;

  @IsOptional()
  @IsEnum(StoneStatus)
  status?: StoneStatus;

  @IsOptional()
  @IsString()
  parcelId?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minCarat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCarat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}
