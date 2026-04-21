import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/productos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('api/productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async create(@Body() createProductoDto: CreateProductoDto) {
    const data = await this.productosService.create(createProductoDto);
    return { statusCode: HttpStatus.CREATED, message: 'Producto creado', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findAll() {
    const data = await this.productosService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Productos listados', data };
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.OPERADOR, Rol.CONTADOR, Rol.VISUALIZADOR)
  async findOne(@Param('id') id: string) {
    const data = await this.productosService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'Producto obtenido', data };
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    const data = await this.productosService.update(id, updateProductoDto);
    return { statusCode: HttpStatus.OK, message: 'Producto actualizado', data };
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.productosService.remove(id);
    return { statusCode: HttpStatus.OK, message: 'Producto desactivado', data };
  }
}
