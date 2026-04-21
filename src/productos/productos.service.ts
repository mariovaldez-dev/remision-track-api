import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/productos.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: createProductoDto
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto
    });
  }

  async remove(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false }
    });
  }
}
