import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UnidadMedida } from '@prisma/client';

export class CreateProductoDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsEnum(UnidadMedida)
  unidadMedida: UnidadMedida;

  @IsOptional()
  @IsNumber()
  precioBase?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
