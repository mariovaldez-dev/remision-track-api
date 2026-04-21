import { IsNotEmpty, IsNumber } from 'class-validator';

export class GenerateCorteDto {
  @IsNotEmpty()
  @IsNumber()
  mes: number;

  @IsNotEmpty()
  @IsNumber()
  anio: number;
}
