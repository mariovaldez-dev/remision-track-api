import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateItemNotaDto {
  @IsOptional()
  @IsString()
  productoId?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  cantidad: number;

  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @IsNumber()
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  descuentoPct?: number;
}

export class CreateNotaDto {
  @IsNotEmpty()
  @IsString()
  clienteId: string;

  @IsNotEmpty()
  @IsDateString()
  fechaEmision: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  condicionesPago?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  firmadoPor?: string;

  @IsOptional()
  @IsString()
  entregadoPor?: string;

  /**
   * Si se proporciona, se usa como folio. Si no, se autogenera (NR-YYYY-####).
   */
  @IsOptional()
  @IsString()
  folioManual?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemNotaDto)
  items: CreateItemNotaDto[];
}

export class UpdateNotaDto extends PartialType(CreateNotaDto) {}

export class UpdateFolioDto {
  @IsNotEmpty()
  @IsString()
  folio: string;
}
