import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotaDto, UpdateNotaDto } from './dto/notas.dto';

@Injectable()
export class NotasService {
  constructor(private prisma: PrismaService) {}

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NR-${year}-`;
    
    const lastNota = await this.prisma.notaDeRemision.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: 'desc' }
    });

    if (!lastNota) {
      return `${prefix}0001`;
    }

    const lastCounter = parseInt(lastNota.folio.split('-')[2], 10);
    const nextCounter = lastCounter + 1;
    return `${prefix}${nextCounter.toString().padStart(4, '0')}`;
  }

  async create(createNotaDto: CreateNotaDto, userId: string) {
    if (!createNotaDto.items || createNotaDto.items.length === 0) {
      throw new BadRequestException('La nota debe tener al menos un item');
    }

    // Usar folio manual si se especifica, o autogenerarlo
    let folio: string;
    if (createNotaDto.folioManual?.trim()) {
      const existing = await this.prisma.notaDeRemision.findFirst({
        where: { folio: createNotaDto.folioManual.trim() }
      });
      if (existing) {
        throw new BadRequestException(`El folio "${createNotaDto.folioManual}" ya existe`);
      }
      folio = createNotaDto.folioManual.trim();
    } else {
      folio = await this.generateFolio();
    }

    let subtotalGeneral = 0;
    let descuentoGeneral = 0;

    const itemsData = createNotaDto.items.map(item => {
      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precioUnitario);
      const descPct = Number(item.descuentoPct || 0);

      const subtotalItemBase = cantidad * precioUnitario;
      const descMontoItem = subtotalItemBase * (descPct / 100);
      const subtotalFinalItem = subtotalItemBase - descMontoItem;

      subtotalGeneral += subtotalItemBase;
      descuentoGeneral += descMontoItem;

      return {
        productoId: item.productoId,
        descripcion: item.descripcion,
        cantidad,
        unidadMedida: item.unidadMedida,
        precioUnitario,
        descuentoPct: descPct,
        subtotal: subtotalFinalItem
      };
    });

    const total = subtotalGeneral - descuentoGeneral;

    // Ejecutar en transacción para asegurar integridad
    return this.prisma.$transaction(async (tx) => {
      const nota = await tx.notaDeRemision.create({
        data: {
          folio,
          clienteId: createNotaDto.clienteId,
          fechaEmision: new Date(createNotaDto.fechaEmision),
          fechaVencimiento: createNotaDto.fechaVencimiento ? new Date(createNotaDto.fechaVencimiento) : null,
          estadoPago: 'PENDIENTE',
          subtotal: subtotalGeneral,
          descuento: descuentoGeneral,
          total,
          saldoPendiente: total,
          condicionesPago: createNotaDto.condicionesPago,
          observaciones: createNotaDto.observaciones,
          firmadoPor: createNotaDto.firmadoPor,
          entregadoPor: createNotaDto.entregadoPor,
          createdBy: userId,
          items: {
            create: itemsData
          }
        },
        include: { items: true, cliente: true }
      });
      return nota;
    });
  }

  async findAll(userId: string, userRole: string) {
    // OPERADOR solo ve sus propias notas
    const where = userRole === 'OPERADOR' ? { createdBy: userId } : {};

    return this.prisma.notaDeRemision.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: { select: { nombreComercial: true, rfc: true } },
        creador: { select: { nombre: true, apellido: true } }
      }
    });
  }

  async findOne(id: string) {
    const nota = await this.prisma.notaDeRemision.findUnique({
      where: { id },
      include: { items: true, cliente: true, pagos: true }
    });
    if (!nota) throw new NotFoundException('Nota no encontrada');
    return nota;
  }

  async cancel(id: string) {
    const nota = await this.findOne(id);
    if (nota.estadoPago === 'PAGADO' || nota.pagos.length > 0) {
      throw new BadRequestException('No se puede cancelar una nota con pagos registrados');
    }
    return this.prisma.notaDeRemision.update({
      where: { id },
      data: { estadoPago: 'CANCELADO' }
    });
  }

  async updateFolio(id: string, nuevoFolio: string) {
    const nota = await this.prisma.notaDeRemision.findUnique({ where: { id } });
    if (!nota) throw new NotFoundException('Nota no encontrada');

    if (nota.estadoPago === 'CANCELADO') {
      throw new BadRequestException('No se puede modificar el folio de una nota cancelada');
    }

    const trimmed = nuevoFolio.trim().toUpperCase();

    // Verificar que el folio no esté en uso por otra nota
    const existing = await this.prisma.notaDeRemision.findFirst({
      where: { folio: trimmed, id: { not: id } }
    });
    if (existing) {
      throw new ConflictException(`El folio "${trimmed}" ya está en uso por la nota ${existing.id}`);
    }

    const updated = await this.prisma.notaDeRemision.update({
      where: { id },
      data: { folio: trimmed },
      include: { cliente: { select: { nombreComercial: true } } }
    });

    return updated;
  }
}
