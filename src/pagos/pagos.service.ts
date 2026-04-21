import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/pagos.dto';
import { EstadoPago } from '@prisma/client';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagoDto: CreatePagoDto, userId: string) {
    const nota = await this.prisma.notaDeRemision.findUnique({
      where: { id: createPagoDto.notaId }
    });

    if (!nota) {
      throw new NotFoundException('Nota de remisión no encontrada');
    }

    if (nota.estadoPago === 'PAGADO') {
      throw new BadRequestException('Esta nota ya está completamente pagada');
    }

    const montoPago = Number(createPagoDto.monto);
    const saldoActual = Number(nota.saldoPendiente);

    if (montoPago > saldoActual) {
      throw new BadRequestException(`El monto de pago ($${montoPago}) excede el saldo pendiente ($${saldoActual})`);
    }

    const nuevoSaldo = saldoActual - montoPago;
    const nuevoTotalPagado = Number(nota.totalPagado) + montoPago;
    let nuevoEstado: EstadoPago = 'PARCIAL';

    if (nuevoSaldo === 0) {
      nuevoEstado = 'PAGADO';
    }

    return this.prisma.$transaction(async (tx) => {
      // Registrar el pago
      const pago = await tx.pago.create({
        data: {
          notaId: createPagoDto.notaId,
          monto: montoPago,
          fechaPago: new Date(createPagoDto.fechaPago),
          formaPago: createPagoDto.formaPago,
          referencia: createPagoDto.referencia,
          banco: createPagoDto.banco,
          notas: createPagoDto.notas,
          createdBy: userId,
        }
      });

      // Actualizar la nota
      await tx.notaDeRemision.update({
        where: { id: nota.id },
        data: {
          saldoPendiente: nuevoSaldo,
          totalPagado: nuevoTotalPagado,
          estadoPago: nuevoEstado,
        }
      });

      return pago;
    });
  }

  async findByNota(notaId: string) {
    return this.prisma.pago.findMany({
      where: { notaId },
      orderBy: { createdAt: 'desc' },
      include: { creador: { select: { nombre: true, apellido: true } } }
    });
  }

  async remove(id: string) {
    // Only ADMIN should be able to do this. Controller will enforce it.
    const pago = await this.prisma.pago.findUnique({ where: { id }, include: { nota: true } });
    if (!pago) throw new NotFoundException('Pago no encontrado');

    const nota = pago.nota;
    const nuevoSaldo = Number(nota.saldoPendiente) + Number(pago.monto);
    const nuevoTotalPagado = Number(nota.totalPagado) - Number(pago.monto);
    
    let nuevoEstado: EstadoPago = 'PARCIAL';
    if (nuevoTotalPagado === 0) nuevoEstado = 'PENDIENTE';
    if (nota.fechaVencimiento && new Date(nota.fechaVencimiento) < new Date() && nuevoSaldo > 0) {
      nuevoEstado = 'VENCIDO';
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.notaDeRemision.update({
        where: { id: nota.id },
        data: {
          saldoPendiente: nuevoSaldo,
          totalPagado: nuevoTotalPagado,
          estadoPago: nuevoEstado
        }
      });
      return tx.pago.delete({ where: { id } });
    });
  }
}
