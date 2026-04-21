import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FormaPago } from '@prisma/client';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsString()
  notaId: string;

  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsNotEmpty()
  @IsDateString()
  fechaPago: string;

  @IsEnum(FormaPago)
  formaPago: FormaPago;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  banco?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
