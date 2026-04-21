import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClienteDto {
  @IsNotEmpty()
  nombreComercial: string;

  @IsOptional()
  razonSocial?: string;

  @IsOptional()
  rfc?: string;

  @IsOptional()
  regimenFiscal?: string;

  @IsOptional()
  usoCfdi?: string;

  @IsOptional()
  direccionCalle?: string;

  @IsOptional()
  direccionColonia?: string;

  @IsOptional()
  direccionCiudad?: string;

  @IsOptional()
  direccionEstado?: string;

  @IsOptional()
  codigoPostal?: string;

  @IsOptional()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  contactoNombre?: string;

  @IsOptional()
  @IsInt()
  diasCredito?: number;

  @IsOptional()
  @IsNumber()
  limiteCredito?: number;

  @IsOptional()
  notas?: string;
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @IsOptional()
  activo?: boolean;
}
