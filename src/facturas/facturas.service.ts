import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoPago } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacturaDto } from './dto/facturas.dto';

@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}

  async create(createFacturaDto: CreateFacturaDto, userId: string) {
    const { notasIds, ...facturaData } = createFacturaDto;

    return this.prisma.$transaction(async (tx) => {
      // Verificar que todas las notas existen y no están canceladas
      const notas = await tx.notaDeRemision.findMany({
        where: { id: { in: notasIds } }
      });
      if (notas.length !== notasIds.length) {
        throw new BadRequestException('Una o más notas no existen');
      }
      const canceladas = notas.filter(n => n.estadoPago === 'CANCELADO');
      if (canceladas.length > 0) {
        throw new BadRequestException(`Las notas canceladas no se pueden facturar: ${canceladas.map(n => n.folio).join(', ')}`);
      }

      const factura = await tx.factura.create({
        data: {
          ...facturaData,
          fechaTimbrado: new Date(facturaData.fechaTimbrado),
          createdBy: userId,
          notas: {
            create: notasIds.map(notaId => ({
              nota: { connect: { id: notaId } }
            }))
          }
        },
        include: {
          notas: { include: { nota: { select: { folio: true, cliente: { select: { nombreComercial: true } } } } } }
        }
      });

      // Cambiar estado de las notas a FACTURADO
      await tx.notaDeRemision.updateMany({
        where: { id: { in: notasIds }, estadoPago: { not: EstadoPago.PAGADO } },
        data: { estadoPago: EstadoPago.FACTURADO }
      });

      return factura;
    });
  }

  async findAll() {
    return this.prisma.factura.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        notas: { include: { nota: { select: { folio: true, total: true, estadoPago: true, cliente: { select: { nombreComercial: true } } } } } }
      }
    });
  }

  async findOne(id: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: { notas: { include: { nota: { include: { cliente: true } } } } }
    });
    if (!factura) throw new NotFoundException('Factura no encontrada');
    return factura;
  }

  /**
   * Cancela la factura y devuelve las notas vinculadas a PENDIENTE
   * (a menos que ya estuvieran PAGADAS, esas se preservan)
   */
  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const factura = await tx.factura.findUnique({
        where: { id },
        include: { notas: { include: { nota: true } } }
      });
      if (!factura) throw new NotFoundException('Factura no encontrada');
      if (factura.estatus === 'CANCELADA') {
        throw new BadRequestException('La factura ya está cancelada');
      }

      // Revertir notas FACTURADO → recalcular estado según pagos
      const notaIds = factura.notas.map(n => n.notaId);
      for (const notaId of notaIds) {
        const nota = await tx.notaDeRemision.findUnique({
          where: { id: notaId },
          include: { pagos: true }
        });
        if (!nota || nota.estadoPago === 'PAGADO') continue; // ya pagadas, no tocar

        const totalPagado = nota.pagos.reduce((s, p) => s + Number(p.monto), 0);
        let nuevoEstado: string = 'PENDIENTE';
        if (totalPagado > 0 && totalPagado < Number(nota.total)) nuevoEstado = 'PARCIAL';
        else if (totalPagado >= Number(nota.total)) nuevoEstado = 'PAGADO';

        await tx.notaDeRemision.update({
          where: { id: notaId },
          data: { estadoPago: nuevoEstado as any }
        });
      }

      return tx.factura.update({
        where: { id },
        data: { estatus: 'CANCELADA' }
      });
    });
  }

  /**
   * Elimina la factura y sus relaciones; devuelve las notas a PENDIENTE/PARCIAL
   */
  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const factura = await tx.factura.findUnique({
        where: { id },
        include: { notas: { include: { nota: { include: { pagos: true } } } } }
      });
      if (!factura) throw new NotFoundException('Factura no encontrada');

      // Revertir estados de notas
      for (const { nota } of factura.notas) {
        if (nota.estadoPago === 'PAGADO') continue;
        const totalPagado = nota.pagos.reduce((s, p) => s + Number(p.monto), 0);
        let nuevoEstado: string = 'PENDIENTE';
        if (totalPagado > 0 && totalPagado < Number(nota.total)) nuevoEstado = 'PARCIAL';

        await tx.notaDeRemision.update({
          where: { id: nota.id },
          data: { estadoPago: nuevoEstado as any }
        });
      }

      // Las relaciones NotaFactura se eliminan en cascada por el schema
      await tx.factura.delete({ where: { id } });
      return { message: 'Factura eliminada' };
    });
  }

  /**
   * Marca todas las notas FACTURADO de esta factura como PAGADO
   */
  async marcarPagada(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const factura = await tx.factura.findUnique({
        where: { id },
        include: { notas: { include: { nota: true } } }
      });
      if (!factura) throw new NotFoundException('Factura no encontrada');
      if (factura.estatus === 'CANCELADA') {
        throw new BadRequestException('No se puede marcar como pagada una factura cancelada');
      }

      const notaIds = factura.notas
        .map(n => n.notaId)
        .filter(nId => factura.notas.find(n => n.notaId === nId)?.nota.estadoPago === EstadoPago.FACTURADO);

      if (notaIds.length === 0) {
        throw new BadRequestException('Todas las notas de esta factura ya están en otro estado');
      }

      await tx.notaDeRemision.updateMany({
        where: { id: { in: notaIds } },
        data: {
          estadoPago: 'PAGADO',
          saldoPendiente: 0,
          totalPagado: tx.notaDeRemision.fields.total as any // se actualiza abajo
        }
      });

      // Actualizar totalPagado = total en cada nota
      for (const notaId of notaIds) {
        const nota = await tx.notaDeRemision.findUnique({ where: { id: notaId } });
        if (nota) {
          await tx.notaDeRemision.update({
            where: { id: notaId },
            data: {
              estadoPago: 'PAGADO',
              totalPagado: nota.total,
              saldoPendiente: 0
            }
          });
        }
      }

      return { marcadas: notaIds.length };
    });
  }
}
