import { Injectable, BadRequestException } from '@nestjs/common';
import { EstadoCorte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CortesService {
  constructor(private prisma: PrismaService) {}

  async generate(mes: number, anio: number, userId: string) {
    const existente = await this.prisma.corteMensual.findFirst({
      where: { mes, anio }
    });

    if (existente) {
      throw new BadRequestException(`El corte del mes ${mes}/${anio} ya fue generado`);
    }

    const startDate = new Date(anio, mes - 1, 1);
    const endDate = new Date(anio, mes, 0, 23, 59, 59);

    const notas = await this.prisma.notaDeRemision.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } }
    });

    const totalVentas = notas.reduce((acc, n) => acc + Number(n.total), 0);
    const totalCobrado = notas.reduce((acc, n) => acc + Number(n.totalPagado), 0);
    const totalPendiente = notas.reduce((acc, n) => acc + Number(n.saldoPendiente), 0);

    const corte = await this.prisma.corteMensual.create({
      data: {
        mes,
        anio,
        estado: EstadoCorte.CERRADO,
        totalVendido: totalVentas,
        totalCobrado,
        totalPendiente,
        notasCanceladas: notas.filter(n => n.estadoPago === 'CANCELADO').length,
        generadoPor: userId,
      },
    });

    return corte;
  }

  async findAll() {
    return this.prisma.corteMensual.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }]
    });
  }
}
