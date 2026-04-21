import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { NotasService } from './notas.service';
import { CreateNotaDto, UpdateFolioDto } from './dto/notas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '@prisma/client';
import type { RequestUser } from '../common/types/express';

@Controller('api/notas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR)
  async create(@Body() createNotaDto: CreateNotaDto, @CurrentUser() user: RequestUser) {
    const data = await this.notasService.create(createNotaDto, user.id);
    return { statusCode: HttpStatus.CREATED, message: 'Nota de remisión creada', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findAll(@CurrentUser() user: RequestUser) {
    const data = await this.notasService.findAll(user.id, user.rol);
    return { statusCode: HttpStatus.OK, message: 'Notas listadas', data };
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findOne(@Param('id') id: string) {
    const data = await this.notasService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'Nota obtenida', data };
  }

  @Post(':id/cancelar')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async cancel(@Param('id') id: string) {
    const data = await this.notasService.cancel(id);
    return { statusCode: HttpStatus.OK, message: 'Nota cancelada', data };
  }

  @Patch(':id/folio')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async updateFolio(
    @Param('id') id: string,
    @Body() body: UpdateFolioDto,
  ) {
    const data = await this.notasService.updateFolio(id, body.folio);
    return { statusCode: HttpStatus.OK, message: `Folio actualizado a "${data.folio}"`, data };
  }
}
