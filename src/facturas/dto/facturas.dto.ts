import { EstatusFactura } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFacturaDto {
  @IsNotEmpty({ message: 'El UUID/Folio Fiscal del CFDI es requerido' })
  @IsString()
  folioFiscal: string;

  @IsNotEmpty({ message: 'La serie es requerida' })
  @IsString()
  serie: string;

  @IsNotEmpty({ message: 'El folio es requerido' })
  @IsString()
  folio: string;

  @IsNotEmpty({ message: 'La fecha de timbrado es requerida' })
  @IsDateString()
  fechaTimbrado: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  iva?: number;

  @IsNotEmpty({ message: 'El total del CFDI es requerido' })
  @IsNumber()
  total: number;

  @IsEnum(EstatusFactura)
  estatus: EstatusFactura;

  @IsOptional()
  @IsString()
  xmlUrl?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsArray()
  @IsString({ each: true })
  notasIds: string[];
}
