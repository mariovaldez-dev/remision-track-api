import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto, UpdateClienteDto } from './dto/clientes.dto';
import type { RequestUser } from '../common/types/express';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, userId: string) {
    return this.prisma.cliente.create({
      data: {
        ...createClienteDto,
        createdBy: userId,
      }
    });
  }

  async findAll() {
    // Todos los clientes activos son visibles para todos los roles
    return this.prisma.cliente.findMany({
      where: { activo: true },
      orderBy: { nombreComercial: 'asc' },
      include: { creador: { select: { nombre: true, apellido: true } } }
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        notasDeRemision: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto, userId: string, userRole: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    // OPERADOR solo puede editar sus propios clientes
    if (userRole === 'OPERADOR' && cliente.createdBy !== userId) {
      throw new ForbiddenException('Solo puedes editar los clientes que tú creaste');
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    // OPERADOR solo puede desactivar sus propios clientes
    if (userRole === 'OPERADOR' && cliente.createdBy !== userId) {
      throw new ForbiddenException('Solo puedes desactivar los clientes que tú creaste');
    }

    return this.prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });
  }

  async getSaldo(id: string) {
    const notasPendientes = await this.prisma.notaDeRemision.findMany({
      where: {
        clienteId: id,
        estadoPago: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] }
      },
      select: { saldoPendiente: true }
    });

    const saldoTotal = notasPendientes.reduce((acc, nota) => acc + Number(nota.saldoPendiente), 0);
    return { saldo: saldoTotal };
  }
}
