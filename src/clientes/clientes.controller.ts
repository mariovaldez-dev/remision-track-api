import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/clientes.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Rol } from '@prisma/client';
import type { RequestUser } from '../common/types/express';

@Controller('api/clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR)
  async create(@Body() createClienteDto: CreateClienteDto, @CurrentUser() user: RequestUser) {
    const data = await this.clientesService.create(createClienteDto, user.id);
    return { statusCode: HttpStatus.CREATED, message: 'Cliente creado', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findAll() {
    const data = await this.clientesService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Clientes listados', data };
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findOne(@Param('id') id: string) {
    const data = await this.clientesService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'Cliente obtenido', data };
  }

  @Get(':id/saldo')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async getSaldo(@Param('id') id: string) {
    const data = await this.clientesService.getSaldo(id);
    return { statusCode: HttpStatus.OK, message: 'Saldo obtenido', data };
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR)
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.clientesService.update(id, updateClienteDto, user.id, user.rol);
    return { statusCode: HttpStatus.OK, message: 'Cliente actualizado', data };
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR)
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const data = await this.clientesService.remove(id, user.id, user.rol);
    return { statusCode: HttpStatus.OK, message: 'Cliente desactivado', data };
  }
}
