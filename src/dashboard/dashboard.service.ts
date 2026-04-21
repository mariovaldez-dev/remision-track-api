import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Notas del mes actual
    const notasMes = await this.prisma.notaDeRemision.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth }
      }
    });

    const totalVentasMes = notasMes.reduce((acc, n) => acc + Number(n.total), 0);
    const cobranzaMes = notasMes.reduce((acc, n) => acc + Number(n.totalPagado), 0);

    // Notas pendientes globales
    const notasPendientes = await this.prisma.notaDeRemision.findMany({
      where: { estadoPago: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } }
    });

    const saldoPendienteTotal = notasPendientes.reduce((acc, n) => acc + Number(n.saldoPendiente), 0);
    const notasVencidas = notasPendientes.filter(n => n.estadoPago === 'VENCIDO').length;

    // Productos más vendidos (Top 5)
    const items = await this.prisma.itemNota.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
      where: { productoId: { not: null } }
    });

    // Resolve product names
    const topProductos = await Promise.all(
      items.map(async (item) => {
        const prod = await this.prisma.producto.findUnique({ where: { id: item.productoId! } });
        return { nombre: prod?.nombre || 'Desconocido', cantidad: item._sum.cantidad };
      })
    );

    return {
      kpis: {
        totalVentasMes,
        cobranzaMes,
        saldoPendienteTotal,
        notasVencidas
      },
      topProductos
    };
  }
}
