import { Controller, Get, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { CortesService } from './cortes.service';
import { GenerateCorteDto } from './dto/cortes.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '@prisma/client';
import type { RequestUser } from '../common/types/express';

@Controller('api/cortes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CortesController {
  constructor(private readonly cortesService: CortesService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.CONTADOR)
  async create(@Body() dto: GenerateCorteDto, @CurrentUser() user: RequestUser) {
    const data = await this.cortesService.generate(dto.mes, dto.anio, user.id);
    return { statusCode: HttpStatus.CREATED, message: 'Corte generado', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.CONTADOR)
  async findAll() {
    const data = await this.cortesService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Cortes listados', data };
  }
}
