import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/pagos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '@prisma/client';
import type { RequestUser } from '../common/types/express';

@Controller('api/pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR)
  async create(@Body() createPagoDto: CreatePagoDto, @CurrentUser() user: RequestUser) {
    const data = await this.pagosService.create(createPagoDto, user.id);
    return { statusCode: HttpStatus.CREATED, message: 'Pago registrado', data };
  }

  @Get('nota/:notaId')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findByNota(@Param('notaId') notaId: string) {
    const data = await this.pagosService.findByNota(notaId);
    return { statusCode: HttpStatus.OK, message: 'Pagos listados', data };
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.pagosService.remove(id);
    return { statusCode: HttpStatus.OK, message: 'Pago anulado', data };
  }
}
