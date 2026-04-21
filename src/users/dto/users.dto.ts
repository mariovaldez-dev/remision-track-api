import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsOptional()
  telefono?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class UpdateUserDto {
  @IsOptional()
  nombre?: string;

  @IsOptional()
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @IsOptional()
  telefono?: string;

  @IsOptional()
  activo?: boolean;
}
