import { IsString, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}
