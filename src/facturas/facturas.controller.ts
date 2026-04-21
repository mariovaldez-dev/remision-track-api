import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/facturas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '@prisma/client';
import type { RequestUser } from '../common/types/express';

@Controller('api/facturas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.CONTADOR)
  async create(@Body() createFacturaDto: CreateFacturaDto, @CurrentUser() user: RequestUser) {
    const data = await this.facturasService.create(createFacturaDto, user.id);
    return { statusCode: HttpStatus.CREATED, message: 'Factura registrada', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findAll() {
    const data = await this.facturasService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Facturas listadas', data };
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findOne(@Param('id') id: string) {
    const data = await this.facturasService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'Factura obtenida', data };
  }

  /** Cancelar factura: notas vinculadas regresan a PENDIENTE/PARCIAL */
  @Post(':id/cancelar')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.CONTADOR, Rol.OPERADOR)
  async cancel(@Param('id') id: string) {
    const data = await this.facturasService.cancel(id);
    return { statusCode: HttpStatus.OK, message: 'Factura cancelada', data };
  }

  /** Marcar notas de la factura como PAGADO */
  @Post(':id/pagada')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.CONTADOR)
  async marcarPagada(@Param('id') id: string) {
    const data = await this.facturasService.marcarPagada(id);
    return { statusCode: HttpStatus.OK, message: `${data.marcadas} nota(s) marcadas como PAGADO`, data };
  }

  /** Eliminar factura permanentemente y desvincular notas */
  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.facturasService.remove(id);
    return { statusCode: HttpStatus.OK, message: 'Factura eliminada', data };
  }
}
